"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import HeadingsList, { Heading } from "@/components/headings-list";
import ChatPanel from "@/components/chat-panel";
import FlowchartPanel from "@/components/flowchart-view";
import {
    Search,
    Plus,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";

interface Message {
    id: number;
    sender: "user" | "bot";
    content: string;
    timestamp: string;
    parent_step_id?: string;
}

interface Step {
    id: string;
    goal: string;
    reasoning: string;
    conclusion: string;
    parentId?: string;
}

// your JSON parser
const parseMessage = (
    msg: Message
    ): { content: string; steps?: Step[]; parentStepId?: string } => {
    try {
        const parsed = JSON.parse(msg.content);
        if (msg.sender === "user") {
        return {
            content: parsed.text ?? msg.content,
            parentStepId: parsed.parentStepId,
        };
        } else {
        return {
            content: parsed.finalAnswer ?? msg.content,
            steps: parsed.steps,
            parentStepId: parsed.parentStepId,
        };
        }
    } catch {
        return { content: msg.content };
    }
};

export default function Home() {
    const [headingsCollapsed, setHeadingsCollapsed] = useState(false);

    // — Chats & messages state —
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeChat, setActiveChat] = useState<Heading | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showFlowchart, setShowFlowchart] = useState(false);
    const [exploringStepId, setExploringStepId] = useState<string>();

    // 1) Fetch your existing chats on mount
    useEffect(() => {
        fetchHeadings();
    }, []);

    async function fetchHeadings() {
        const { data, error } = await supabase
        .from("chats")
        .select("id, title, subheading, created_at")
        .order("created_at", { ascending: false });
        if (error) console.error("Failed to load chats:", error);
        else setHeadings(data || []);
    }

    // 2) Create a new chat and immediately load its (empty) message history
    async function createNewChat() {
        setLoading(true);
        try {
        const { data, error } = await supabase
            .from("chats")
            .insert({ title: "New Chat", subheading: "" })
            .select("id, title, subheading, created_at")
            .single();
        if (error) throw error;

        // setHeadings([data]);               // overwrite list with only the new chat
        setHeadings((prev) => [data, ...prev]);
        setActiveChat(data);
        setShowChat(true);
        setShowFlowchart(true);

        // now load messages (will be empty)
        await loadMessages(data.id);
        } catch (e) {
        console.error("Could not create chat:", e);
        } finally {
        setLoading(false);
        }
    }

    // 3) Load the message history for a given chat
    async function loadMessages(chatId: number) {
        setLoading(true);
        const { data, error } = await supabase
        .from("messages")
        .select("id, sender, content, timestamp, parent_step_id")
        .eq("chat_id", chatId)
        .order("timestamp", { ascending: true });
        if (error) console.error("Message load error:", error);
        else setMessages(data || []);
        setLoading(false);
    }

    // 4) When you click an existing chat
    async function onHeadingSelect(h: Heading) {
        setActiveChat(h);
        setShowChat(true);
        setShowFlowchart(true);
        setExploringStepId(undefined);

        // fetch its past messages
        await loadMessages(h.id);

        // subscribe to new ones
        const channel = supabase
        .channel(`chat:${h.id}`)
        .on(
            "postgres_changes" as any,
            {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `chat_id=eq.${h.id}`,
            },
            (payload) => {
            const m = payload.new as Message;
            setMessages((prev) =>
                prev.some((x) => x.id === m.id) ? prev : [...prev, m]
            );
            }
        )
        .subscribe();
        return () => void channel.unsubscribe();
    }

    // 5) Send + store a new user message, then get & store the AI reply
    async function sendMessage(
        chatId: number,
        text: string,
        parentStepId?: string
    ) {
        setLoading(true);
        try {
        // insert the user's message
        const { data: u, error: ue } = await supabase
            .from("messages")
            .insert({
            chat_id: chatId,
            sender: "user",
            content: JSON.stringify({ text, parentStepId }),
            })
            .select()
            .single();
        if (ue) throw ue;
        setMessages((m) => [...m, u]);

        // call your OpenAI endpoint
        const aiRes = await fetch("/api/openai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            prompt: text,
            model: "gpt-4-0125-preview",
            thoughtMode: "chain",
            context: parentStepId
                ? { type: "exploring_step", stepId: parentStepId }
                : undefined,
            }),
        });
        const aiJson = await aiRes.json();
        if (!aiRes.ok) throw new Error(aiJson.error || "AI error");

        // insert the bot's reply
        const { data: b, error: be } = await supabase
            .from("messages")
            .insert({
            chat_id: chatId,
            sender: "bot",
            content: JSON.stringify({ ...aiJson.response, parentStepId }),
            })
            .select()
            .single();
        if (be) throw be;
        setMessages((m) => [...m, b]);
        } catch (e) {
        console.error("Chat error:", e);
        } finally {
        setLoading(false);
        }
    }

    return (
        <div className="flex h-screen bg-[var(--foreground)]">
        <Sidebar />

        <div className="flex flex-1 overflow-hidden space-x-4 p-4">
            {/* Chats panel */}
            <div
            className={`
                relative flex-shrink-0 flex flex-col
                ${headingsCollapsed ? "w-12" : "w-72"}
                bg-white rounded-lg shadow transition-width duration-300
            `}
            >
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--secondary)]">
                <button
                onClick={() => setHeadingsCollapsed((c) => !c)}
                className="hover:bg-[var(--foreground)] rounded"
                >
                {headingsCollapsed ? (
                    <ChevronsRight className="w-5 h-5" />
                ) : (
                    <ChevronsLeft className="w-5 h-5" />
                )}
                </button>

                {!headingsCollapsed && (
                <>
                    <span className="text-md font-medium text-[var(--primary)]">
                    Chats
                    </span>
                    <button
                    onClick={createNewChat}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 text-xs bg-[var(--secondary)] text-white rounded-md hover:bg-[var(--primary)] transition"
                    >
                    <Plus size={16} /> <span>New</span>
                    </button>
                </>
                )}
            </div>

            {!headingsCollapsed && (
                <>
                <div className="px-4 py-2 border-b border-[var(--secondary)]">
                    <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Search chats…"
                        className="w-full pl-3 py-2 bg-[var(--secondary)] text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                    <button className="p-2 bg-[var(--secondary)] rounded-lg hover:bg-[var(--primary)] transition">
                        <Search size={16} className="text-white" />
                    </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <HeadingsList
                    headings={headings}
                    selectedId={activeChat?.id}
                    onHeadingSelect={onHeadingSelect}
                    />
                </div>
                </>
            )}
            </div>

            {/* Main area */}
            <div className="flex-1 flex space-x-4 overflow-hidden">
            {activeChat && showChat && (
                <ChatPanel
                chatId={activeChat.id}
                title={activeChat.title}
                subheading={activeChat.subheading}
                messages={messages}
                loading={loading}
                onSendMessage={(t, p) => sendMessage(activeChat.id, t, p)}
                parseMessage={parseMessage}
                onExploreStep={(stepId) => setExploringStepId(stepId)}
                onReturnToMain={() => setExploringStepId(undefined)}
                onClose={() => setShowChat(false)}
                />
            )}

            {activeChat && showFlowchart && (
                <FlowchartPanel
                messages={messages}
                parseMessage={parseMessage}
                focusedStepId={exploringStepId}
                onClose={() => setShowFlowchart(false)}
                />
            )}

            {!activeChat && (
                <div className="flex-1 flex items-center justify-center italic text-[var(--primary)]">
                Choose which chat to view
                </div>
            )}
            </div>
        </div>
        </div>
    );
}
