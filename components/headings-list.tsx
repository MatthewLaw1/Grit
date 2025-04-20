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
        <div className="space-y-4 ">
        {headings.map((h) => {
            const isSelected = h.id === selectedId
            return (
            <div
                key={h.id}
                onClick={() => select(h)}
                className={`
                rounded-md p-4 cursor-pointer transition-colors
                ${isSelected
                    ? "bg-[var(--secondary)] border border-[var(--primary)]"
                    : "bg-[var(--background)] border border-[var(--secondary)] hover:bg-[var(--foreground)]"}
                `}
            >
                <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-[var(--primary)]">{h.title}</h3>
                <span className="text-xs text-[var(--primary)]">x mins ago</span>
                </div>
                <p className="text-sm text-[var(--primary)]">{h.subheading}</p>
            </div>
            )
        })}
        </div>
    )
}
