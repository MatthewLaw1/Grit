"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar";
import HeadingsList, { Heading } from "../../components/headings-list";
import ChatPanel from "../../components/chat-panel";
import FlowchartPanel from "../../components/flowchart-panel";
import {
    Search,
    Plus,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";

type ModelType = 'openai' | 'cerebras';

interface Message {
    id: number;
    sender: "user" | "bot";
    content: string;
    timestamp: string;
}

interface ReasoningStep {
    id: string;
    goal: string;
    reasoning: string;
    conclusion: string;
    parentId?: string;
}

// your JSON parser
const parseMessage = (
    msg: Message
    ): { content: string; steps?: ReasoningStep[]; stepId?: string; parentStepId?: string } => {
    try {
        const parsed = JSON.parse(msg.content);
        if (msg.sender === "user") {
            return {
                content: parsed.text ?? msg.content,
                parentStepId: parsed.stepId
            };
        } else {
            const response = parsed.response || parsed;
            if (response.stepId) {
                return {
                    content: response.finalAnswer ?? msg.content,
                    steps: response.steps,
                    stepId: response.stepId,
                    parentStepId: response.stepId
                };
            }
            return {
                content: response.finalAnswer ?? msg.content,
                steps: response.steps
            };
        }
    } catch {
        return { content: msg.content };
    }
};

export default function Home() {
    const [headingsCollapsed, setHeadingsCollapsed] = useState(false);
    const [selectedModel, setSelectedModel] = useState<ModelType>('cerebras');

    // Local state for chats and messages
    const [chats, setChats] = useState<Map<number, Message[]>>(new Map());
    const [activeChat, setActiveChat] = useState<Heading | null>(null);
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showFlowchart, setShowFlowchart] = useState(false);
    const [exploringStepId, setExploringStepId] = useState<string>();
    const [nextChatId, setNextChatId] = useState(1);
    const [nextMessageId, setNextMessageId] = useState(1);

    // Create a new chat
    function createNewChat() {
        const chatId = nextChatId;
        const newChat: Heading = {
            id: chatId,
            title: "New Chat",
            subheading: "",
            created_at: new Date().toISOString()
        };

        setChats(prev => new Map(prev).set(chatId, []));
        setActiveChat(newChat);
        setShowChat(true);
        setShowFlowchart(true);
        setNextChatId(chatId + 1);
    }

    // Send a message in the current chat
    async function sendMessage(chatId: number, text: string, stepId?: string) {
        setLoading(true);
        try {
            // Add user message
            const userMessage: Message = {
                id: nextMessageId,
                sender: "user",
                content: JSON.stringify({ text, stepId }),
                timestamp: new Date().toISOString()
            };
            setNextMessageId(prev => prev + 1);

            // Update messages
            setChats(prev => {
                const newMap = new Map(prev);
                const chatMessages = [...(newMap.get(chatId) || []), userMessage];
                newMap.set(chatId, chatMessages);
                return newMap;
            });

            // Call API
            const endpoint = selectedModel === 'openai' ? '/api/openai' : '/api/cerebras';
            const model = selectedModel === 'openai' ? 'gpt-4-0125-preview' : 'deepseek-r1-distill-llama-70b';
            
            const aiRes = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: text,
                    model: model,
                    thoughtMode: "chain",
                    context: stepId ? {
              type: "exploring_step",
              stepId,
              step: messages
                .map(m => parseMessage(m))
                .flatMap(m => m.steps || [])
                .find(s => s.id === stepId)
            } : undefined
                }),
            });
            const aiJson = await aiRes.json();
            if (!aiRes.ok) throw new Error(aiJson.error || "AI error");

            // Add bot message
            const botMessage: Message = {
                id: nextMessageId + 1,
                sender: "bot",
                content: JSON.stringify(aiJson.response),
                timestamp: new Date().toISOString()
            };
            setNextMessageId(prev => prev + 2);

            // Update messages
            setChats(prev => {
                const newMap = new Map(prev);
                const chatMessages = [...(newMap.get(chatId) || []), botMessage];
                newMap.set(chatId, chatMessages);
                return newMap;
            });
        } catch (e) {
            console.error("Chat error:", e);
        } finally {
            setLoading(false);
        }
    }

    // Get messages for the current chat
    const messages = activeChat ? chats.get(activeChat.id) || [] : [];

    // Get all chat headings
    const headings = Array.from(chats.entries()).map(([id, messages]) => ({
        id,
        title: "Chat " + id,
        subheading: messages.length > 0 ? `${messages.length} messages` : "",
        created_at: messages[0]?.timestamp || new Date().toISOString()
    })).sort((a, b) => b.created_at.localeCompare(a.created_at));

    // Handle chat selection
    function onHeadingSelect(h: Heading) {
        setActiveChat(h);
        setShowChat(true);
        setShowFlowchart(true);
        setExploringStepId(undefined);
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
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                            className="px-3 py-2 bg-[var(--secondary)] text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        >
                            <option value="cerebras">DeepSeek R1 Distilled LLaMA 70B</option>
                            <option value="openai">OpenAI GPT-4</option>
                        </select>
                    </div>
                    <ChatPanel
                        chatId={activeChat.id}
                        title={activeChat.title}
                        subheading={activeChat.subheading}
                        messages={messages}
                        loading={loading}
                        onSendMessage={(t, stepId) => sendMessage(activeChat.id, t, stepId)}
                        parseMessage={parseMessage}
                        onExploreStep={(stepId) => setExploringStepId(stepId)}
                        onReturnToMain={() => setExploringStepId(undefined)}
                        onClose={() => setShowChat(false)}
                        focusedStepId={exploringStepId}
                        selectedStep={messages
                          .map(m => parseMessage(m))
                          .flatMap(m => m.steps || [])
                          .find(s => s.id === exploringStepId)}
                    />
                </div>
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
