"use client"

import { useState } from "react"
import { Send, X } from "lucide-react"

interface ChatPanelProps {
    title: string
    subheading: string
    onClose: () => void
}

interface Message {
    id: string
    content: string
    sender: "user" | "bot"
}

export default function ChatPanel({ title, subheading, onClose }: ChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
        id: "1",
        content: "Hello! How can I help you understand time series analysis today?",
        sender: "bot",
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
        }
        setMessages((prev) => [...prev, botMessage])
        }, 1000)
    }

    return (
        <div className="flex-1 flex flex-col bg-[var(--secondary)] rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-[var(--secondary)]">
            <div>
            <h2 className="font-bold text-xl text-[var(--primary)]">{title}</h2>
            <p className="text-sm text-[var(--primary)]">{subheading}</p>
            </div>
            <button onClick={onClose} className="text-[var(--primary)] hover:bg-[var(--background)] p-1 rounded-full">
            <X size={20} />
            </button>
        </div>

        <div className="flex-1 bg-[var(--secondary)] p-4 overflow-y-auto">
            <div className="space-y-4">
            {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user" ? "bg-[var(--primary)] text-[var(--foreground)]" : "bg-[var(--background)] text-[var(--primary)]"
                    }`}
                >
                    {message.content}
                </div>
                </div>
            ))}
            </div>
        </div>

        <div className="p-4 bg-[var(--secondary)]">
            <div className="flex bg-[var(--background)] rounded-full overflow-hidden">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-transparent outline-none"
                onKeyDown={(e) => {
                if (e.key === "Enter") {
                    handleSendMessage()
                }
                }}
            />
            <button onClick={handleSendMessage} className="p-2 bg-[var(--secondary)] rounded-full m-1">
                <Send size={20} className="text-[var(--primary)]" />
            </button>
            </div>
        </div>
        </div>
    )
}
