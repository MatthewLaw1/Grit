"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar"
import HeadingsList from "@/components/headings-list"
import ChatPanel from "@/components/chat-panel"
import FlowchartPanel from "@/components/flowchart-panel"
import { Search } from "lucide-react"

export default function Home() {
    const [showHeadingsList, setShowHeadingsList] = useState(true)
    const [showChat, setShowChat] = useState(true)
    const [showFlowchart, setShowFlowchart] = useState(true)
    const [activeHeading, setActiveHeading] = useState({
        title: "Headings",
        subheading: "subheadings",
    })

    return (
        <div className="flex h-screen bg-[var(--background)]">
        <Sidebar />

        <div className="flex flex-1 overflow-hidden p-4 space-x-4 bg-[var(--foreground)]">
            {showHeadingsList && (
            <div className="w-[300px] bg-[var(--background)] overflow-y-auto p-4 rounded-lg">
                <div className="relative mb-4">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--secondary)]"
                />
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full bg-[var(--foreground)] rounded-md py-2 pl-10 pr-4 text-sm"
                />
                </div>
                <HeadingsList onHeadingSelect={setActiveHeading} />
            </div>
            )}

            <div className="flex-1 flex space-x-4 overflow-hidden">
            {showChat && (
                <ChatPanel
                title={activeHeading.title}
                subheading={activeHeading.subheading}
                onClose={() => setShowChat(false)}
                />
            )}

            {showFlowchart && (
                <FlowchartPanel onClose={() => setShowFlowchart(false)} />
            )}
            </div>
        </div>
        </div>
    )
}
