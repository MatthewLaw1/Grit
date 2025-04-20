"use client"

import { useState } from "react"
import Sidebar from "@/components/sideBar"
import HeadingsList from "@/components/headings-list"
import ChatView from "@/components/chat-view"
import FlowchartView from "@/components/flowchart-view"
import { Search } from "lucide-react"

export default function Home() {
    const [activeView, setActiveView] = useState<"chat" | "flowchart">("chat")

    return (
        <div className="flex h-screen bg-[#F0F0F0]">
        <Sidebar />
        <div className="flex flex-1 overflow-hidden">
            <div className="w-[350px] bg-[#D1D8DE] p-4 overflow-y-auto">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                type="text"
                placeholder="Search"
                className="w-full bg-[#F0F0F0] rounded-md py-2 pl-10 pr-4 text-sm"
                />
            </div>
            <HeadingsList onViewChange={setActiveView} activeView={activeView} />
            </div>
            <div className="flex-1 p-4 overflow-auto">{activeView === "chat" ? <ChatView /> : <FlowchartView />}</div>
        </div>
        </div>
    )
}
