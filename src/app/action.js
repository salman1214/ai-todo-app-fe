'use server'
import { cookies } from 'next/headers'
import { todosTable,usersTable } from '../../db/schema';
import { db } from '../../db';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { eq, ilike } from 'drizzle-orm';

function parseAIResponse(responseText) {
    // console.log("responseText ======>> ", responseText);

    // First check if the input is already a valid JSON string
    try {
        const parsed = JSON.parse(responseText);
        return [parsed]; // Return as array with single object
    } catch (e) {
        // Not a direct JSON string, try to extract from markdown code blocks
    }

    // Extract multiple JSON objects from the response using regex
    const jsonRegex = /```json\s*({[\s\S]*?})\s*```/g;
    const jsonObjects = [];
    let match;

    // Find all matches of JSON code blocks
    while ((match = jsonRegex.exec(responseText)) !== null) {
        try {
            const jsonObject = JSON.parse(match[1]);
            jsonObjects.push(jsonObject);
        } catch (error) {
            console.error("Failed to parse JSON from code block:", error);
        }
    }

    // If we found JSON objects in code blocks, return them
    if (jsonObjects.length > 0) {
        return jsonObjects;
    }

    // If no JSON found in code blocks, try to find any JSON-like structures
    const fallbackRegex = /{[\s\S]*?}/g;
    const fallbackObjects = [];

    while ((match = fallbackRegex.exec(responseText)) !== null) {
        try {
            const jsonObject = JSON.parse(match[0]);
            fallbackObjects.push(jsonObject);
        } catch (error) {
            // Silently fail for this fallback approach
        }
    }

    // If we found valid JSON objects with the fallback approach, return them
    if (fallbackObjects.length > 0) {
        return fallbackObjects;
    }

    // Return empty array if no JSON objects were found
    return [];
}

const SYSTEM_PROPT = `

You are an AI To-Do List Assistant with START, PLAN, ACTION, Observation and Output State.
Wait for the user prompt and first PLAN using available tools.
After Planning, Take the action with appropriate tools and wait for Observation based on Action.
Once you get the observations, Return the AI response based on START prompt and observations

You can manage tasks by adding, viewing, updating, and deleting
You must strictly follow the JSON output format.

Todo DB Schema:
id: Int and Primary Key
todo: String
created_at: Date Time
updated_at: Date Time

Available Tools:
- getAllTodos(): Returns all the Todos from Database
- createTodo (todo: string): Creates a new Todo in the DB and takes todo as a string
- updateTodoById(id: string, todo: string): Updates the todo by ID given in the DB
- deleteTodoById (id: string): Deleted the todo by ID given in the DB
- searchTodosByKeyword(keyword: string): Searches for all todos matching the keyword string using iLike in DB

Example:
START
{ "type": "user", "user": "Add a task for shopping groceries." }
{ "type": "plan", "plan": "I will try to get more context on what user needs to shop." }
{ "type": "output", "output": "Can you tell me what all items you want to shop for?" }
{ "type": "user", "user": "I want to shop for milk, kurkure, lays and choco." }
{ "type": "plan", "plan": "I will use createTodo to create a new Todo in DB." }
{ "type": "action", "function": "createTodo", "input": "Shopping for milk, kurkure, lays and choco." }
{ "type": "observation", "observation": "2" }
{ "type": "output", "output": "You todo has been added successfully with todo id of 2" }

When sending the output, make sure to send the JSON string as the output like this:
{
    "type": "output",
    "output": "Hello there! How can I help you today?"
}

`;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// ===============================================================================
// ================================== | TODOS | ==================================
// ===============================================================================
export async function getAllTodos() {
    const todos = await db.select().from(todosTable);
    return todos;
}

async function createTodo(todo) {
    const [result] = await db.insert(todosTable).values({ todo }).returning({ id: todosTable.id });
    return result.id;
}

async function updateTodoById(todo) {
    const updatedTodo = await db
        .update(todosTable)
        .set({ todo: todo.todo })
        .where(eq(todosTable.id, todo.id));
    return updatedTodo;
}

async function deleteTodoById(id) {
    const deletedTodo = await db
        .delete(todosTable)
        .where(eq(todosTable.id, id));
    return deletedTodo;
}

async function searchTodosByKeyword(todo) {
    const todos = await db
        .select()
        .from(todosTable)
        .where(ilike(todosTable.todo, `%${todo}%`));
    return todos;
}

const tools = {
    getAllTodos,
    createTodo,
    updateTodoById,
    deleteTodoById,
    searchTodosByKeyword,
};

const messages = [
    { role: "user", parts: [{ text: "hi" }] },
    { role: "model", parts: [{ text: SYSTEM_PROPT }] },
];

export async function launchTodoPrompt(prompt) {
    const query = {
        type: "user",
        input: prompt
    }
    const parsedQuery = JSON.stringify(query);

    if (messages.length === 0) {
        messages.push({ role: "user", parts: [{ text: "hi" }] });
        messages.push({ role: "model", parts: [{ text: SYSTEM_PROPT }] });
        messages.push({ role: "user", parts: [{ text: parsedQuery }] });
    } else messages.push({ role: "user", parts: [{ text: parsedQuery }] })

    while (true) {
        const chat = model.startChat({
            history: messages,
        });

        let result = await chat.sendMessage(prompt);
        let action = parseAIResponse(result.response.text());
        messages.push({ role: "model", parts: [{ text: JSON.stringify(action[action.length - 1]) }] });

        if (action[action.length - 1].type === "output") {
            // console.log(`🤖: ${action[action.length - 1].output}`);
            return `🤖: ${action[action.length - 1].output}`;
        } else if (action[action.length - 1].type === "action") {
            const fn = tools[action[action.length - 1].function];
            if (!fn) throw new Error('Invalid tool');
            const observation = await fn(action[action.length - 1].input);
            const observationMessage = { type: "observation", observation };
            messages.push({ role: "model", parts: [{ text: JSON.stringify(observationMessage) }] });
        }
    }
}

// ===============================================================================
// ================================== | AUTH | ===================================
// ===============================================================================
export async function login(data) {
    try {
        const user = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, data.email))
            .where(eq(usersTable.password, data.password));

        if (user.length === 0) {
            return { error: "Invalid credentials" };
        }

        return { message: "User logged in successfully", user: user[0] };
    } catch (error) {
        console.log(error);
        return { error: error };
    }

    
}

export async function signup(data) {
    try {
        const user = await db.insert(usersTable).values(data).returning({ id: usersTable.id });
        return { message: "User created successfully", user: user[0] };
    } catch (error) {
        console.log(error);
        return error;
    }

}

// ===============================================================================
// ================================= | COOKIES | =================================
// ===============================================================================
export async function createCookieToken() {
    const cookieStore = await cookies()
    cookieStore.set('ai-todo-token', 'asdassdas87asf8saf7dsyf87sdafas87df')
}

export async function createCookie(data) {
    const cookieStore = await cookies()
    cookieStore.set('ai-todo-user-info', data)
}

export async function removeCookie() {
    const cookieStore = await cookies()
    cookieStore.delete('ai-todo-token')
    cookieStore.delete('ai-todo-user-info')
}

export async function getCookie() {
    const cookieStore = await cookies()
    return cookieStore.get('ai-todo-token')
}

export async function hasCookie() {
    const cookieStore = await cookies()
    return cookieStore.has('ai-todo-token')
}