import { NextResponse } from "next/server";
import { getAllTodos } from "@/app/action";

export async function GET() {
    const todos = await getAllTodos();
    return NextResponse.json({ message: "Hello World", todos });
}