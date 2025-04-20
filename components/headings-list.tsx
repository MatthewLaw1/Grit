"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"

export interface Heading {
    id: number
    title: string
    subheading: string
}

interface HeadingsListProps {
    onHeadingSelect: (h: Heading) => void
}

export default function HeadingsList({ onHeadingSelect }: HeadingsListProps) {
    const [headings, setHeadings] = useState<Heading[]>([])
    const [selectedId, setSelectedId] = useState<number | null>(null)

    useEffect(() => {
        async function load() {
        let { data, error } = await supabase
            .from<Heading>("chats")
            .select("id, title, subheading")
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error loading chats:", error)
        } else {
            setHeadings(data)
        }
        }
        load()
    }, [])

    const select = (h: Heading) => {
        setSelectedId(h.id)
        onHeadingSelect(h)
    }

    return (
        <div className="space-y-2">
        {headings.map((h) => (
            <div
            key={h.id}
            onClick={() => select(h)}
            className={`
                p-3 rounded-lg cursor-pointer transition
                ${h.id === selectedId
                ? "bg-[var(--secondary)] border border-[var(--primary)]"
                : "bg-[var(--background)] border border-[var(--secondary)] hover:bg-[var(--foreground)]"
                }
            `}
            >
            <div className="flex justify-between">
                <span className="font-semibold text-[var(--primary)]">{h.title}</span>
                <span className="text-xs text-[var(--primary)]">
                {/* you could format created_at here */}
                </span>
            </div>
            <p className="text-sm text-[var(--primary)]">{h.subheading}</p>
            </div>
        ))}
        </div>
    )
}
