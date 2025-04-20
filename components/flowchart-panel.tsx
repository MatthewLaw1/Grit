"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { X } from "lucide-react"

interface Flowchart {
    id: number
    image_url: string
}

interface FlowchartPanelProps {
    chatId: number
    onClose: () => void
}

export default function FlowchartPanel({ chatId, onClose }: FlowchartPanelProps) {
    const [flowchart, setFlowchart] = useState<Flowchart | null>(null)

    useEffect(() => {
        async function load() {
        let { data, error } = await supabase
            .from<Flowchart>("flowcharts")
            .select("id, image_url")
            .eq("chat_id", chatId)
            .maybeSingle()
        if (error) console.error("Flowchart load error:", error)
        else setFlowchart(data)
        }
        if (chatId) load()
    }, [chatId])

    return (
        <div className="flex-1 flex flex-col bg-[var(--secondary)] rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-[var(--secondary)]">
            <h2 className="font-bold text-xl text-[var(--primary)]">Flowchart</h2>
            <button onClick={onClose} className="text-[var(--primary)] p-1 rounded-full hover:bg-[var(--foreground)]">
            <X size={20} />
            </button>
        </div>

        <div className="flex-1 p-4 bg-[var(--background)] overflow-auto">
            {flowchart ? (
            <img src={flowchart.image_url} alt="flowchart" className="w-full h-auto object-contain" />
            ) : (
            <p className="text-center italic text-[var(--primary)]">No flowchart available</p>
            )}
        </div>
        </div>
    )
}
