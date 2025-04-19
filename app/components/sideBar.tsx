import { MessageSquare, Archive } from "lucide-react"
import Image from "next/image"

export default function Sidebar() {
    return (
        <div className="w-[80px] bg-[#2A394C] flex flex-col items-center py-6">
        <div className="mb-4">
            <div className="text-white text-3xl border-b-2 border-[var(--foreground)] pb-4">
                {/* <span className="font-bold">Grit</span> */}
                <Image 
                    src="/icon.png"
                    alt="Logo"
                    width={45}
                    height={45}
                />
            </div>
        </div>
        <div className="flex flex-col items-center space-y-8">
            <div className="flex flex-col items-center text-white">
            <MessageSquare size={28} />
            <span className="text-xs mt-1">Chats</span>
            </div>
            <div className="flex flex-col items-center text-white opacity-60">
            <Archive size={28} />
            <span className="text-xs mt-1">Archives</span>
            </div>
        </div>
        </div>
    )
}
