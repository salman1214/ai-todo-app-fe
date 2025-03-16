import { NextResponse } from "next/server";

export async function POST(request, res) {
    const data = await request.json();
    console.log("REQUEST ", data);
    return NextResponse.json({ message: "Hello World" });
}