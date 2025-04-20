"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface Message {
    id: string
    content: string
    sender: "user" | "bot"
    timestamp: Date
}

export default function ChatView() {
    const [messages, setMessages] = useState<Message[]>([
        {
        id: "1",
        content: "Hello! How can I help you understand time series analysis today?",
        sender: "bot",
        timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState("")

    const handleSendMessage = () => {
        if (!input.trim()) return

        // Add user message
        const userMessage: Message = {
        id: Date.now().toString(),
        content: input,
        sender: "user",
        timestamp: new Date(),
        }

        setMessages([...messages, userMessage])
        setInput("")

        // Simulate bot response
        setTimeout(() => {
        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            content:
            "I understand your question about time series analysis. Would you like to learn more about stationarity or regression models?",
            sender: "bot",
            timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
        }, 1000)
    }

    return (
        <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === "user" ? "bg-[var(--primary)] text-[var(--foreground)]" : "bg-[var(--secondary)] text-[var(--primary)]"
                }`}
                >
                {message.content}
                </div>
            </div>
            ))}
        </div>
        <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                onKeyDown={(e) => {
                if (e.key === "Enter") {
                    handleSendMessage()
                }
                }}
            />
            <Button onClick={handleSendMessage} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)]">
                <Send size={18} />
            </Button>
            </div>
        </div>
        </div>
    )
}
