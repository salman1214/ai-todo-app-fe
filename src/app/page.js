"use client";
import ChatBot from "@/components/Main/ChatBot";
import TodosComponent from "@/components/Main/TodosComponent";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { getAllTodos, removeCookie } from "./action";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { redirect } from 'next/navigation'

// const allTodos = await getAllTodos();
export default function Home() {
  const [todos, setTodos] = useState([]);

  const refreshTodos = async () => {
    const freshTodos = await getAllTodos();
    setTodos(freshTodos);
  };

  // Load todos on initial render
  useEffect(() => {
    refreshTodos();
  }, []);

  const onLogout = async () => {
    await removeCookie();
    redirect('/login');
  }

  return (
    <div className="h-screen">
      {/* <Button
        className="absolute top-3 left-[47%] h-10 w-20 cursor-pointer active:translate-y-[1px]"
        onClick={onLogout}
      >
        Logout
      </Button> */}
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <ChatBot refreshTodos={refreshTodos} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <TodosComponent allTodos={todos} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>


  );
}
