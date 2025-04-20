"use client";

import { useState, useEffect } from "react";
import { Send, X, ArrowLeft, ExternalLink } from "lucide-react";

interface Step {
  goal: string;
  reasoning: string;
  conclusion: string;
  id: string;
  parentId?: string;
}

interface ParsedMessage {
  content: string;
  steps?: Step[];
  parentStepId?: string;
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
  onSendMessage: (
    text: string,
    parentStepId?: string,
    parentStep?: Step
  ) => void;
  parseMessage: (msg: Message) => ParsedMessage;
  onExploreStep?: (stepId: string) => void;
  onReturnToMain?: () => void;
}

// Helper function to parse messages
const parseMessage = (msg: Message): ParsedMessage => {
  try {
    const parsed = JSON.parse(msg.content);
    if (msg.sender === "user") {
      return {
        content: parsed.text,
        parentStepId: parsed.parentStepId,
      };
    } else {
      return {
        content: parsed.finalAnswer,
        steps: parsed.steps,
        parentStepId: parsed.parentStepId,
      };
    }
  } catch {
    // Fallback for old messages or parsing errors
    return { content: msg.content };
  }
};

export default function ChatPanel({
  chatId,
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
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);

  // Find the original message containing the step being explored
  useEffect(() => {
    if (!exploringStepId) {
      setSelectedStep(null);
      return;
    }

    // Look through all messages to find the step
    for (const msg of messages) {
      const parsed = parseMessage(msg);
      if (parsed.steps) {
        const step = parsed.steps.find((s) => s.id === exploringStepId);
        if (step) {
          setSelectedStep(step);
          break;
        }
      }
    }
  }, [exploringStepId, messages, parseMessage]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    onSendMessage(
      text,
      exploringStepId || undefined,
      selectedStep || undefined
    );
  };

  const startExploringStep = (stepId: string) => {
    setExploringStepId(stepId);
    // Emit the step ID to parent component
    if (onExploreStep) {
      onExploreStep(stepId);
    }
  };

  const stopExploringStep = () => {
    setExploringStepId(null);
    setSelectedStep(null);
    // Notify parent component
    if (onReturnToMain) {
      onReturnToMain();
    }
  };

  // Filter messages based on exploration context
  const relevantMessages = messages.filter((msg) => {
    const parsed = parseMessage(msg);
    return exploringStepId
      ? parsed.parentStepId === exploringStepId
      : !parsed.parentStepId;
  });

  return (
    <div className="flex-1 flex flex-col bg-[var(--secondary)] rounded-lg overflow-hidden">
      {/* header */}
      <div className="flex justify-between items-center p-4 bg-[var(--secondary)]">
        <div className="flex items-center gap-3">
          {exploringStepId && (
            <button
              onClick={stopExploringStep}
              className="text-[var(--primary)] hover:bg-[var(--background)] p-1 rounded-full"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="font-bold text-xl text-white">{title}</h2>
            <p className="text-sm text-white">
              {exploringStepId ? "Exploring reasoning step" : subheading}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white p-1 rounded-full hover:bg-[var(--background)]"
        >
          <X size={20} />
        </button>
      </div>

      {/* Selected step context */}
      {selectedStep && (
        <div className="px-4 py-3 bg-blue-50 border-y border-blue-100">
          <div className="text-sm text-blue-800 font-medium mb-2">
            Currently exploring:
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="font-medium text-gray-800">
              Goal: {selectedStep.goal}
            </div>
            <div className="text-gray-600 mt-1">
              Reasoning: {selectedStep.reasoning}
            </div>
            <div className="font-medium text-gray-800 mt-1">
              Conclusion: {selectedStep.conclusion}
            </div>
          </div>
        </div>
      )}

      {/* messages list */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {loading ? (
          <p className="text-[var(--primary)]">Loading…</p>
        ) : relevantMessages.length === 0 ? (
          <p className="italic text-[var(--primary)] text-center">
            {exploringStepId
              ? "Start exploring this reasoning step..."
              : "No messages yet"}
          </p>
        ) : (
          relevantMessages.map((msg) => {
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
                  {msg.sender === "bot" && parsed.steps && !exploringStepId && (
                    <div className="mt-3 border-t border-gray-200 pt-3">
                      <div className="text-sm font-medium mb-2">
                        Reasoning Steps:
                      </div>
                      {parsed.steps.map((step) => (
                        <div key={step.id} className="mb-3 text-sm">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">Goal: {step.goal}</div>
                            <button
                              onClick={() => startExploringStep(step.id)}
                              className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-xs"
                            >
                              <ExternalLink size={12} />
                              Explore this reasoning
                            </button>
                          </div>
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
        {exploringStepId && (
          <div className="mb-2 px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full inline-block">
            Exploring reasoning step
          </div>
        )}
        <div className="flex bg-[var(--background)] rounded-full overflow-hidden">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              exploringStepId
                ? "Ask about this reasoning step..."
                : "Type your message…"
            }
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
