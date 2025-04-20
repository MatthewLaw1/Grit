"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { Send, X } from "lucide-react"

export interface Message {
    id: number
    sender: "user" | "bot"
    content: string
    timestamp: string
}

interface ChatPanelProps {
    chatId: number
    title: string
    subheading: string
    onClose: () => void
}

export default function ChatPanel({
    chatId,
    title,
    subheading,
    onClose,
    }: ChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!chatId) {
        setMessages([])
        return
        }
        setLoading(true)
        supabase
        .from("messages")
        .select("id, sender, content, timestamp")
        .eq("chat_id", chatId)
        .order("timestamp", { ascending: true })
        .then(({ data, error }) => {
            if (error) console.error("Error loading messages:", error)
            else setMessages(data || [])
        })
        .then(() => {
            setLoading(false)
        })
    }, [chatId])

    const handleSend = () => {
        const text = input.trim()
        if (!text) return
        setInput("")
        supabase
        .from("messages")
        .insert({ chat_id: chatId, sender: "user", content: text })
        .select("id, sender, content, timestamp")
        .then(({ data, error }) => {
            if (error) console.error("Send error:", error)
            else setMessages((prev) => [...prev, ...(data || [])])
        })
    }

    return (
        <div className="flex-1 flex flex-col bg-[var(--secondary)] rounded-lg overflow-hidden">
        {/* header */}
        <div className="flex justify-between items-center p-4 bg-[var(--secondary)]">
            <div>
            <h2 className="font-bold text-xl text-[var(--primary)]">{title}</h2>
            <p className="text-sm text-[var(--primary)]">{subheading}</p>
            </div>
            <button
            onClick={onClose}
            className="text-[var(--primary)] p-1 rounded-full hover:bg-[var(--background)]"
            >
            <X size={20} />
            </button>
        </div>

        {/* messages list */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {loading ? (
            <p className="text-[var(--primary)]">Loading…</p>
            ) : messages.length === 0 ? (
            <p className="italic text-[var(--primary)] text-center">
                No messages yet
            </p>
            ) : (
            messages.map((msg) => (
                <div
                key={msg.id}
                className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
                >
                <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === "user"
                        ? "bg-[var(--primary)] text-[var(--foreground)]"
                        : "bg-[var(--background)] text-[var(--primary)]"
                    }`}
                >
                    {msg.content}
                </div>
                </div>
            ))
            )}
        </div>

        {/* input */}
        <div className="p-4 bg-[var(--secondary)]">
            <div className="flex bg-[var(--background)] rounded-full overflow-hidden">
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message…"
                className="flex-1 px-4 py-2 bg-transparent outline-none"
            />
            <button onClick={handleSend} className="p-2">
                <Send size={20} className="text-[var(--primary)]" />
            </button>
            </div>
        </div>
        </div>
    )
}
