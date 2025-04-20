import { useState } from "react";
import { MessageSquare, Archive } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Sidebar() {
    const [activeItem, setActiveItem] = useState("chats");

    return (
        <div className="w-[80px] bg-[#2A394C] flex flex-col items-center py-6">
            <div className="mb-4">
                <div className="text-white text-3xl border-b-2 border-[var(--foreground)] pb-4">
                    <Link href="/#">
                        <Image 
                            src="/icon.png"
                            alt="Logo"
                            width={45}
                            height={45}
                        />
                    </Link>
                </div>
            </div>
            <div className="flex flex-col items-center space-y-8 pt-4">
                <div
                    className={`flex flex-col items-center cursor-pointer ${
                        activeItem === "chats" ? "text-white" : "text-white/60"
                    } hover:text-white/80`}
                    onClick={() => setActiveItem("chats")}
                >
                    <MessageSquare size={28} />
                    <span className="text-xs mt-1">Chats</span>
                </div>
                <div
                    className={`flex flex-col items-center cursor-pointer ${
                        activeItem === "archives" ? "text-white" : "text-white/60"
                    } hover:text-white/80`}
                    onClick={() => setActiveItem("archives")}
                >
                    <Archive size={28} />
                    <span className="text-xs mt-1">Archives</span>
                </div>
            </div>
        </div>
    );
}
