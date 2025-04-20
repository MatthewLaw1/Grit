"use client";

import { useState } from "react";
import { Send, X } from "lucide-react";

interface Step {
  goal: string;
  reasoning: string;
  conclusion: string;
  id: string;
  parentId?: string;
}

export interface Message {
  id: number;
  sender: "user" | "bot";
  content: string;
  timestamp: string;
}

interface ChatPanelProps {
  chatId: number;
  title: string;
  subheading: string;
  onClose: () => void;
  messages: Message[];
  loading: boolean;
  onSendMessage: (text: string) => void;
  parseMessage: (msg: Message) => { content: string; steps?: Step[] };
}

export default function ChatPanel({
  chatId,
  title,
  subheading,
  onClose,
  messages,
  loading,
  onSendMessage,
  parseMessage,
}: ChatPanelProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    onSendMessage(text);
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--secondary)] rounded-lg overflow-hidden">
      {/* header */}
      <div className="flex justify-between items-center p-4 bg-[var(--secondary)]">
        <div>
          <h2 className="font-bold text-xl text-[var(--primary)]">{title}</h2>
          <p className="text-sm text-[var(--primary)]">{subheading}</p>
        </div>
        <button
          onClick={onClose}
          className="text-[var(--primary)] p-1 rounded-full hover:bg-[var(--background)]"
        >
          <X size={20} />
        </button>
      </div>

      {/* messages list */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {loading ? (
          <p className="text-[var(--primary)]">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="italic text-[var(--primary)] text-center">
            No messages yet
          </p>
        ) : (
          messages.map((msg) => {
            const parsed = parseMessage(msg);
            return (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.sender === "user"
                      ? "bg-[var(--primary)] text-[var(--foreground)]"
                      : "bg-[var(--background)] text-[var(--primary)]"
                  }`}
                >
                  {parsed.content}
                  {msg.sender === "bot" && parsed.steps && (
                    <div className="mt-3 border-t border-gray-200 pt-3">
                      <div className="text-sm font-medium mb-2">
                        Reasoning Steps:
                      </div>
                      {parsed.steps.map((step) => (
                        <div key={step.id} className="mb-3 text-sm">
                          <div className="font-medium">Goal: {step.goal}</div>
                          <div className="text-gray-600">
                            Reasoning: {step.reasoning}
                          </div>
                          <div className="font-medium mt-1">
                            Conclusion: {step.conclusion}
                          </div>
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

      {/* input */}
      <div className="p-4 bg-[var(--secondary)]">
        <div className="flex bg-[var(--background)] rounded-full overflow-hidden">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message…"
            className="flex-1 px-4 py-2 bg-transparent outline-none"
          />
          <button onClick={handleSend} className="p-2">
            <Send size={20} className="text-[var(--primary)]" />
          </button>
        </div>
      </div>
    </div>
  );
}
