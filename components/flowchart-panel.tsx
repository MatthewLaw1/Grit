"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"

interface FlowchartPanelProps {
    onClose: () => void
}

export default function FlowchartPanel({ onClose }: FlowchartPanelProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        // In a real implementation, you would use a library like mermaid.js, react-flow, or d3.js
        // to render the flowchart. For this example, I'm using an image.
        const renderFlowchart = () => {
        const container = containerRef.current
        if (!container) return

        // Clear previous content
        container.innerHTML = ""

        // Create and append the image
        const img = document.createElement("img")
        img.src =
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Chat%20%26%20Reasoning%20Flow1-T6fhlVhYzbrsL4r6yXdEp2E2YltBXu.png"
        img.alt = "Time Series Analysis Flowchart"
        img.style.width = "100%"
        img.style.height = "auto"
        img.style.objectFit = "contain"

        container.appendChild(img)
        }

        renderFlowchart()

        // Re-render on window resize
        window.addEventListener("resize", renderFlowchart)
        return () => {
        window.removeEventListener("resize", renderFlowchart)
        }
    }, [])

    return (
        <div className="flex-1 flex flex-col bg-[#A1B2C2] rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-[#A1B2C2]">
            <h2 className="font-bold text-xl text-[#2A394C]">Flowchart</h2>
            <button onClick={onClose} className="text-[#2A394C] hover:bg-[#8A9BB2] p-1 rounded-full">
            <X size={20} />
            </button>
        </div>

        <div className="flex-1 bg-[#D1D8DE] overflow-auto">
            <div ref={containerRef} className="w-full h-full"></div>
        </div>
        </div>
    )
}
