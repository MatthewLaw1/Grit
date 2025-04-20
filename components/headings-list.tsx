"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface Heading {
    id: string
    title: string
    subheading: string
}

interface HeadingsListProps {
    onViewChange: (view: "chat" | "flowchart") => void
    activeView: "chat" | "flowchart"
}

export default function HeadingsList({ onViewChange, activeView }: HeadingsListProps) {
    const [headings] = useState<Heading[]>([
        { id: "1", title: "Headings", subheading: "subheadings" },
        { id: "2", title: "Headings", subheading: "subheadings" },
        { id: "3", title: "Headings", subheading: "subheadings" },
    ])

    return (
        <div className="space-y-4">
        {headings.map((heading) => (
            <div key={heading.id} className="bg-[#A1B2C2] rounded-md p-4">
            <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-[#2A394C]">{heading.title}</h3>
                <span className="text-xs text-[#2A394C]">x mins</span>
            </div>
            <p className="text-sm text-[#2A394C] mb-3">{heading.subheading}</p>
            <div className="flex space-x-2">
                <Button
                variant={activeView === "chat" ? "default" : "outline"}
                className={`rounded-md py-1 px-4 text-sm ${activeView === "chat" ? "bg-[#2A394C] text-white" : "bg-[#D1D8DE] text-[#2A394C]"}`}
                onClick={() => onViewChange("chat")}
                >
                Chat
                </Button>
                <Button
                variant={activeView === "flowchart" ? "default" : "outline"}
                className={`rounded-md py-1 px-4 text-sm ${activeView === "flowchart" ? "bg-[#2A394C] text-white" : "bg-[#D1D8DE] text-[#2A394C]"}`}
                onClick={() => onViewChange("flowchart")}
                >
                Flowchart
                </Button>
            </div>
            </div>
        ))}
        </div>
    )
}
