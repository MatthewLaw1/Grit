"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import HeadingsList, { Heading } from "@/components/headings-list"
import ChatPanel from "@/components/chat-panel"
import FlowchartPanel from "@/components/flowchart-panel"
import { Search, Plus, ChevronsLeft, ChevronsRight } from "lucide-react"

export default function Home() {
    const [headingsCollapsed, setHeadingsCollapsed] = useState(false)
    const [headingsKey, setHeadingsKey] = useState(0)
    const [activeChat, setActiveChat] = useState<Heading | null>(null)
    const [showChat, setShowChat] = useState(false)
    const [showFlowchart, setShowFlowchart] = useState(false)

    const onHeadingSelect = (h: Heading) => {
        setActiveChat(h)
        setShowChat(true)
        setShowFlowchart(true)
    }

    const createNewChat = async () => {
        const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat", subheading: "" }),
        })
        if (!res.ok) throw new Error("Could not create chat")
        const newChat: Heading = await res.json()

        // open the new chat immediately
        setActiveChat(newChat)
        setShowChat(true)
        setShowFlowchart(true)

        // refresh the headings list so it appears
        setHeadingsKey((k) => k + 1)
    }

    return (
        <div className="flex h-screen bg-[var(--background)]">
        <Sidebar />

        <div className="flex flex-1 overflow-hidden p-4 space-x-4 bg-[var(--foreground)]">
            {/* Chats panel */}
            <div
            className={`
                relative flex-shrink-0 flex flex-col transition-[width] duration-300 ease-in-out
                ${headingsCollapsed ? "w-12" : "w-72"}
                bg-[var(--background)] rounded-lg shadow
            `}
            >
            <div className="flex items-center justify-between px-2 py-2 border-b border-[var(--secondary)]">
                <button
                onClick={() => setHeadingsCollapsed((c) => !c)}
                className="p-1 hover:bg-[var(--secondary)] rounded"
                >
                {headingsCollapsed
                    ? <ChevronsRight size={20} />
                    : <ChevronsLeft size={20} />}
                </button>

                {!headingsCollapsed && (
                <>
                    <h2 className="flex-1 text-lg font-medium text-[var(--primary)]">
                    Chats
                    </h2>
                    <button
                    onClick={createNewChat}
                    className="flex items-center space-x-1 px-2 py-1 text-sm font-medium text-[var(--primary)] rounded hover:bg-[var(--secondary)]"
                    >
                    <Plus size={16} /> <span>New Chat</span>
                    </button>
                </>
                )}
            </div>

            {!headingsCollapsed && (
                <>
                <div className="px-4 py-2 border-b border-[var(--secondary)]">
                    <div className="relative">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary)]"
                    />
                    <input
                        type="text"
                        placeholder="Search chats…"
                        className="w-full pl-10 pr-3 py-2 bg-[var(--foreground)] rounded-md text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 bg-[var(--background)]">
                    {/* key changes force HeadingsList to re-fetch */}
                    <HeadingsList key={headingsKey} onHeadingSelect={onHeadingSelect} />
                </div>
                </>
            )}
            </div>

            {/* Main area */}
            <div className="flex-1 flex space-x-4 overflow-hidden">
            {activeChat && showChat && (
                <ChatPanel
                chatId={activeChat.id}
                title={activeChat.title}
                subheading={activeChat.subheading}
                onClose={() => setShowChat(false)}
                />
            )}

            {activeChat && showFlowchart && (
                <FlowchartPanel
                chatId={activeChat.id}
                onClose={() => setShowFlowchart(false)}
                />
            )}

            {(!showChat || !activeChat) && (!showFlowchart || !activeChat) && (
                <div className="flex-1 flex items-center justify-center italic text-[var(--primary)]">
                Choose which chat to view
                </div>
            )}
            </div>
        </div>
        </div>
    )
    }
