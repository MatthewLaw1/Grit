"use client";

import { useState, useEffect, useRef } from "react";
import { Send, X, ArrowLeft, FolderTree } from "lucide-react";

export interface Message {
  id: number;
  sender: "user" | "bot";
  content: string;
  timestamp: string;
}

export interface ParsedMessage {
  content: string;
  steps?: { id: string; goal: string; reasoning: string; conclusion: string }[];
  parentStepId?: string;
}

interface ChatPanelProps {
  chatId: number;
  title: string;
  subheading: string;
  onClose: () => void;
  messages: Message[];
  loading: boolean;
  onSendMessage: (text: string, parentStepId?: string) => void;
  parseMessage: (msg: Message) => ParsedMessage;
  onExploreStep?: (stepId: string) => void;
  onReturnToMain?: () => void;
}

export default function ChatPanel({
  title,
  subheading,
  onClose,
  messages,
  loading,
  onSendMessage,
  parseMessage,
  onExploreStep,
  onReturnToMain,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [exploringStepId, setExploringStepId] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<{ id: string; goal: string; reasoning: string; conclusion: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // auto‑scroll on new content
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, exploringStepId]);

  // find the selected step’s details
  useEffect(() => {
    if (!exploringStepId) {
      setSelectedStep(null);
      return;
    }
    for (let msg of messages) {
      const { steps } = parseMessage(msg);
      if (steps) {
        const step = steps.find((s) => s.id === exploringStepId);
        if (step) {
          setSelectedStep(step as any);
          return;
        }
      }
    }
  }, [exploringStepId, messages, parseMessage]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed, exploringStepId || undefined);
    setInput("");
  };

  const startExplore = (id: string) => {
    setExploringStepId(id);
    onExploreStep?.(id);
  };
  const stopExplore = () => {
    setExploringStepId(null);
    setSelectedStep(null);
    onReturnToMain?.();
  };

  // show only messages relevant to current exploration context
  const relevant = messages.filter((msg) => {
    const { parentStepId } = parseMessage(msg);
    return exploringStepId ? parentStepId === exploringStepId : !parentStepId;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full bg-[var(--secondary)] rounded-lg overflow-hidden text-sm">
      {/* ── Header ── */}
      <div className="flex items-center justify-between p-4 bg-[var(--secondary)]">
        <div className="flex items-center gap-3">
          {exploringStepId && (
            <button
              onClick={stopExplore}
              className="p-1 text-white hover:bg-[var(--primary)] rounded"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="text-xs text-gray-200">
              {exploringStepId ? "Exploring Reasoning Step" : subheading}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-white hover:bg-[var(--background)] rounded"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Step Details Card ── */}
      {selectedStep && (
        <div className="m-4 p-4 bg-[var(--foreground)] rounded-lg shadow-inner border-l-4 border-[var(--primary)]">
          <div className="inline-flex items-center mb-3 text-[var(--primary)]">
            {/* <FolderTree size={4} className="mr-2" /> */}
            <h3 className="text-lg font-semibold">Step Details</h3>
          </div>
          <div className="space-y-2 text-gray-800">
            <div>
              <h4 className="font-bold text-[var(--secondary)]">Goal</h4>
              <p>{selectedStep.goal}</p>
            </div>
            <div>
              <h4 className="font-bold text-[var(--secondary)]">Reasoning</h4>
              <p>{selectedStep.reasoning}</p>
            </div>
            <div>
              <h4 className="font-bold text-[var(--secondary)]">Conclusion</h4>
              <p>{selectedStep.conclusion}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Message List ── */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6 no-scrollbar"
      >
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-6 h-6 border-4 border-[var(--background)] border-t-[var(--primary)] rounded-full animate-spin" />
          </div>
        ) : relevant.length === 0 ? (
          <div className="text-gray-400 italic text-center">
            {exploringStepId
              ? "No replies in this step yet."
              : "Send a message to start the conversation."}
          </div>
        ) : (
          relevant.map((msg) => {
            const { content, steps } = parseMessage(msg);
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-4 rounded-xl shadow-md ${
                    isUser
                      ? "bg-[var(--primary)] text-white"
                      : "bg-white text-[var(--primary)]"
                  }`}
                >
                  <p className="leading-relaxed">{content}</p>

                  {!isUser && steps && !exploringStepId && (
                    <div className="mt-4 grid gap-3">
                      {steps.map((s) => (
                        <div
                          key={s.id}
                          className="p-3 bg-[var(--foreground)] rounded-lg shadow-sm flex justify-between items-center"
                        >
                          <span className="font-semibold text-sm">{s.goal}</span>
                          <button
                            onClick={() => startExplore(s.id)}
                            className="inline-flex items-center text-[var(--primary)] text-xs font-medium"
                          >
                            <FolderTree size={14} className="mr-1" />
                            Explore
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Input Bar ── */}
      <div className="p-4 bg-[var(--secondary)]">
        <div className="flex items-center bg-[var(--background)] rounded-full overflow-hidden">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              exploringStepId
                ? "Ask a follow-up on this step…"
                : "Type your message…"
            }
            className="flex-1 px-4 py-2 text-sm bg-transparent outline-none"
          />
          <button onClick={handleSend} className="p-2">
            <Send size={18} className="text-[var(--primary)]" />
          </button>
        </div>
      </div>
    </div>
  );
}
