"use client";
import React, { useState } from 'react'
import { Input } from '../ui/input'
import { IoSendSharp } from "react-icons/io5";
import { Button } from '../ui/button';
import { launchTodoPrompt } from '@/app/action';

const ChatBot = ({ refreshTodos }) => {
    const [chat, setChat] = useState([]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const onSendMessage = async () => {
        if (!message || isLoading) return;

        try {
            setIsLoading(true);
            const userMessage = { role: "user", text: message };
            setChat(prevChat => [...prevChat, userMessage]);
            setMessage("");

            const result = await launchTodoPrompt(message);
            console.log("AI RESULT => ", result);

            // Update chat with the AI response
            setChat(prevChat => [...prevChat, { role: "model", text: result }]);

            // Refresh todos after successful AI response
            await refreshTodos();
        } catch (error) {
            console.error("Error processing message:", error);
            setChat(prevChat => [...prevChat, { role: "model", text: "Sorry, there was an error processing your request." }]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='p-4 flex flex-col h-full items-center'>
            <div className='flex-1 mb-4 text-center text-2xl font-bold'>Welcome To ToDo AI Agent</div>

            <div className='w-full flex flex-col gap-4 overflow-y-scroll h-screen pb-20'>
                {
                    chat.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-2 bg-gray-300 rounded-lg ${msg.role === 'user' ? 'bg-green-300 text-black' : 'bg-gray-300 text-black'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))
                }
            </div>

            <div className='flex gap-3 w-full'>
                <Input
                    type="text"
                    placeholder={isLoading ? "Processing..." : "Create your todos..."}
                    className="h-10"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSendMessage()}
                    disabled={isLoading}
                />
                <Button
                    className="h-10 w-20 cursor-pointer active:translate-y-[1px]"
                    onClick={onSendMessage}
                    disabled={isLoading}
                >
                    <IoSendSharp color='black' />
                </Button>
            </div>
        </div>
    )
}

export default ChatBot