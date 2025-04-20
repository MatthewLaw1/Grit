"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import HeadingsList from "@/components/headings-list"
import ChatPanel from "@/components/chat-panel"
import FlowchartPanel from "@/components/flowchart-panel"
import { Search, Plus, ChevronsLeft, ChevronsRight } from "lucide-react"

export default function Home() {
    const [headingsCollapsed, setHeadingsCollapsed] = useState(false)
    const [showChat, setShowChat] = useState(true)
    const [showFlowchart, setShowFlowchart] = useState(true)
    const [activeHeading, setActiveHeading] = useState({
        title: "Headings",
        subheading: "subheadings",
    })

    const selectHeading = (h: { title: string; subheading: string }) => {
        setActiveHeading(h)
        setShowChat(true)
        setShowFlowchart(true)
    }

    const createNewChat = () => {
        const blank = { title: "New Chat", subheading: "" }
        setActiveHeading(blank)
        setShowChat(true)
        setShowFlowchart(true)
        // TODO: insert into your data source
    }

    const toggleHeadings = () => setHeadingsCollapsed((c) => !c)
    const handleChatClose = () => setShowChat(false)
    const handleFlowchartClose = () => setShowFlowchart(false)

    return (
        <div className="flex h-screen bg-[var(--background)]">
        <Sidebar />

        <div className="flex flex-1 overflow-hidden p-4 space-x-4 bg-[var(--foreground)]">
            <div
                className={`
                    relative flex-shrink-0 flex flex-col rounded-lg
                    transition-[width] duration-300 ease-in-out 
                    ${headingsCollapsed ? "w-12" : "w-72"}
                `}
            >
            <div className="flex items-center justify-between px-2 py-2 bg-[var(--background)] border-b border-[var(--secondary)]">
                <button
                onClick={toggleHeadings}
                className="p-1 hover:bg-[var(--secondary)] rounded"
                >
                {headingsCollapsed
                    ? <ChevronsRight size={20} />
                    : <ChevronsLeft size={20} />}
                </button>

                {!headingsCollapsed && (
                <>
                    {/* <h2 className="flex-1 text-lg font-medium text-[var(--primary)]">
                    Chats
                    </h2> */}
                    <button
                    onClick={createNewChat}
                    className="flex items-center space-x-1 px-2 py-1 text-sm font-medium bg-[var(--secondary)] text-[var(--primary)] rounded hover:bg-[var(--primary)] hover:text-[var(--foreground)] transition-colors"
                    >
                    <Plus size={16} />
                    <span>New Chat</span>
                    </button>
                </>
                )}
            </div>

            {!headingsCollapsed && (
                <div className="px-4 py-2 bg-[var(--background)] border-b border-[var(--secondary)]">
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
            )}

            {!headingsCollapsed && (
                <div className="flex-1 overflow-y-auto px-2 py-3 bg-[var(--background)]">
                <HeadingsList onHeadingSelect={selectHeading} />
                </div>
            )}
            </div>

            <div className="flex-1 flex space-x-4 overflow-hidden">
            {showChat && (
                <ChatPanel
                title={activeHeading.title}
                subheading={activeHeading.subheading}
                onClose={handleChatClose}
                />
            )}
            {showFlowchart && (
                <FlowchartPanel onClose={handleFlowchartClose} />
            )}
            {!showChat && !showFlowchart && (
                <div className="flex-1 flex items-center justify-center italic text-[var(--primary)]">
                Choose which chat to view
                </div>
            )}
            </div>
        </div>
        </div>
    )
}
