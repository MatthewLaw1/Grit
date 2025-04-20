"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import HeadingsList, { Heading } from "@/components/headings-list";
import ChatPanel from "@/components/chat-panel";
import FlowchartPanel from "@/components/flowchart-view";
import { Search, Plus, ChevronsLeft, ChevronsRight } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

interface Message {
    id: number;
    sender: "user" | "bot";
    content: string;
    timestamp: string;
    parentStepId?: string;
}

interface Step {
    goal: string;
    reasoning: string;
    conclusion: string;
    id: string;
    parentId?: string;
}

// Helper function to parse messages
const parseMessage = (
    msg: Message
    ): { content: string; steps?: Step[]; parentStepId?: string } => {
    try {
        const parsed = JSON.parse(msg.content);
        if (msg.sender === "user") {
        return {
            content: parsed.text || msg.content,
            parentStepId: parsed.parentStepId,
        };
        } else {
        return {
            content: parsed.finalAnswer || msg.content,
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
    const [headingsKey, setHeadingsKey] = useState(0);
    const [activeChat, setActiveChat] = useState<Heading | null>(null);
    const [showChat, setShowChat] = useState(false);
    const [showFlowchart, setShowFlowchart] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [exploringStepId, setExploringStepId] = useState<string | undefined>();

    const loadMessages = async (chatId: number) => {
        setLoading(true);
        try {
        const { data, error } = await supabase
            .from("messages")
            .select("id, sender, content, timestamp, parent_step_id")
            .eq("chat_id", chatId)
            .order("timestamp", { ascending: true });

        if (error) throw error;
        setMessages(data || []);
        } catch (error) {
        console.error("Error loading messages:", error);
        } finally {
        setLoading(false);
        }
    };

    const sendMessage = async (
        chatId: number,
        text: string,
        parentStepId?: string,
        parentStep?: Step
    ) => {
        setLoading(true);
        try {
        // Save user message
        const { data: userData, error: userError } = await supabase
            .from("messages")
            .insert({
            chat_id: chatId,
            sender: "user",
            content: JSON.stringify({
                text,
                parentStepId,
            }),
            })
            .select("id, sender, content, timestamp")
            .single();

        if (userError) throw userError;
        setMessages((prev) => [...prev, userData]);

        // Get AI response with context about the step being explored
        const aiResponse = await fetch("/api/openai", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            prompt: text,
            model: "gpt-4-0125-preview",
            thoughtMode: "chain",
            context: parentStepId
                ? {
                    type: "exploring_step",
                    stepId: parentStepId,
                    parentStep,
                    originalMessages: messages
                    .filter((m) => !parseMessage(m).parentStepId)
                    .map((m) => parseMessage(m).content),
                }
                : undefined,
            }),
        });

        const aiData = await aiResponse.json();
        if (!aiResponse.ok) {
            throw new Error(aiData.error || "Failed to get AI response");
        }

        // Save AI response
        const { data: botData, error: botError } = await supabase
            .from("messages")
            .insert({
            chat_id: chatId,
            sender: "bot",
            content: JSON.stringify({
                ...aiData.response,
                parentStepId,
            }),
            })
            .select("id, sender, content, timestamp")
            .single();

        if (botError) throw botError;
        setMessages((prev) => [...prev, botData]);
        } catch (error) {
        console.error("Error in chat sequence:", error);
        } finally {
        setLoading(false);
        }
    };

    const onHeadingSelect = async (h: Heading) => {
        setActiveChat(h);
        setShowChat(true);
        setShowFlowchart(true);
        setExploringStepId(undefined); // Reset exploration state when changing chats
        await loadMessages(h.id);

        // Set up realtime subscription
        const channel = supabase.channel(`chat:${h.id}`);
        channel
        .on(
            "postgres_changes" as any,
            {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `chat_id=eq.${h.id}`,
            },
            (payload) => {
            const newMessage = payload.new as Message;
            if (newMessage) {
                setMessages((prev) => {
                const exists = prev.some((msg) => msg.id === newMessage.id);
                if (exists) return prev;
                return [...prev, newMessage];
                });
            }
            }
        )
        .subscribe();

        return () => {
        channel.unsubscribe();
        };
    };

    const createNewChat = async () => {
        const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat", subheading: "" }),
        });
        if (!res.ok) throw new Error("Could not create chat");
        const newChat: Heading = await res.json();

        // open the new chat immediately
        setActiveChat(newChat);
        setShowChat(true);
        setShowFlowchart(true);

        // refresh the headings list so it appears
        setHeadingsKey((k) => k + 1);
    };

    const handleExploreStep = (stepId: string) => {
        setExploringStepId(stepId);
    };

    const handleReturnToMain = () => {
        setExploringStepId(undefined);
    };

    return (
        <div className="flex h-screen bg-[var(--background)]">
        <Sidebar />
        <div className="flex flex-1 overflow-hidden p-4 space-x-4 bg-[var(--foreground)]">
            {/* Chats panel */}
            <div
            className={`
                relative flex-shrink-0 flex flex-col transition-[width] duration-300 ease-in-out
                ${headingsCollapsed ? "w-12" : "w-72"}
                bg-[var(--background)] rounded-lg shadow
            `}
            >
            <div className="flex items-center justify-between px-2 py-2 border-b border-[var(--secondary)]">
                <button
                onClick={() => setHeadingsCollapsed((c) => !c)}
                className="p-1 hover:bg-[var(--secondary)] rounded"
                >
                {headingsCollapsed ? (
                    <ChevronsRight size={20} />
                ) : (
                    <ChevronsLeft size={20} />
                )}
                </button>

                {!headingsCollapsed && (
                <>
                    <h2 className="flex-1 text-lg font-medium text-[var(--primary)]">
                    Chats
                    </h2>
                    <button
                    onClick={createNewChat}
                    className="flex items-center space-x-1 px-2 py-1 text-sm font-medium text-[var(--primary)] rounded hover:bg-[var(--secondary)]"
                    >
                    <Plus size={16} /> <span>New Chat</span>
                    </button>
                </>
                )}
            </div>

            {!headingsCollapsed && (
                <>
                <div className="px-4 py-2 border-b border-[var(--secondary)]">
                    <div className="relative">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary)]"
                    />
                    <input
                        type="text"
                        placeholder="Search chats…"
                        className="w-full pl-10 pr-3 py-2 bg-[var(--foreground)] rounded-md text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 bg-[var(--background)]">
                    <HeadingsList
                    key={headingsKey}
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
                onClose={() => setShowChat(false)}
                messages={messages}
                loading={loading}
                onSendMessage={(text, parentStepId) =>
                    sendMessage(activeChat.id, text, parentStepId)
                }
                parseMessage={parseMessage}
                onExploreStep={handleExploreStep}
                onReturnToMain={handleReturnToMain}
                />
            )}

            {activeChat && showFlowchart && (
                <FlowchartPanel
                onClose={() => setShowFlowchart(false)}
                messages={messages}
                parseMessage={parseMessage}
                focusedStepId={exploringStepId}
                />
            )}

            {(!showChat || !activeChat) && (!showFlowchart || !activeChat) && (
                <div className="flex-1 flex items-center justify-center italic text-[var(--primary)]">
                Choose which chat to view
                </div>
            )}
            </div>
        </div>
        </div>
    );
}
