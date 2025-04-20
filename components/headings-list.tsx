"use client"

import { useState } from "react"

interface Heading {
    id: string
    title: string
    subheading: string
}

interface HeadingsListProps {
    onHeadingSelect: (heading: { title: string; subheading: string }) => void
}

export default function HeadingsList({ onHeadingSelect }: HeadingsListProps) {
    const [headings] = useState<Heading[]>([
        { id: "1", title: "Headings", subheading: "subheadings" },
        { id: "2", title: "Headings", subheading: "subheadings" },
        { id: "3", title: "Headings", subheading: "subheadings" },
    ])

    const [selectedId, setSelectedId] = useState<string>("1")

    const select = (h: Heading) => {
        setSelectedId(h.id)
        onHeadingSelect({ title: h.title, subheading: h.subheading })
    }

    return (
        <div className="space-y-4">
        {headings.map((h) => {
            const isSelected = h.id === selectedId
            return (
            <div
                key={h.id}
                onClick={() => select(h)}
                className={`
                rounded-md p-4 cursor-pointer transition-colors
                ${isSelected
                    ? "bg-[#A1B2C2]"
                    : "bg-[#D1D8DE] hover:bg-[#C1C8CE]"}
                `}
            >
                <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-[#2A394C]">{h.title}</h3>
                <span className="text-xs text-[#2A394C]">x mins</span>
                </div>
                <p className="text-sm text-[#2A394C]">{h.subheading}</p>
            </div>
            )
        })}
        </div>
    )
}
