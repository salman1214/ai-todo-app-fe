import { createTodo, deleteTodoById, getAllTodos, searchTodosByKeyword, updateTodoById } from "@/app/action";
import { NextResponse } from "next/server";



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(request, res) {
    const data = await request.json();
    console.log("REQUEST ", data);
    return NextResponse.json({ message: "Hello World" });
}