"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { Send, X } from "lucide-react";
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

interface Step {
  goal: string;
  reasoning: string;
  conclusion: string;
  id: string;
  parentId?: string;
}

interface AIResponse {
  steps: Step[];
  finalAnswer: string;
}

export interface Message {
  id: number;
  sender: "user" | "bot";
  content: string;
  timestamp: string;
}

// Helper function to parse bot messages
const parseMessage = (msg: Message): { content: string; steps?: Step[] } => {
  if (msg.sender !== "bot") return { content: msg.content };
  try {
    const parsed = JSON.parse(msg.content);
    return {
      content: parsed.finalAnswer,
      steps: parsed.steps,
    };
  } catch {
    return { content: msg.content };
  }
};

interface ChatPanelProps {
  chatId: number;
  title: string;
  subheading: string;
  onClose: () => void;
}

export default function ChatPanel({
  chatId,
  title,
  subheading,
  onClose,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("id, sender, content, timestamp, steps")
          .eq("chat_id", chatId)
          .order("timestamp", { ascending: true });

        if (error) {
          throw error;
        }

        setMessages(data || []);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Set up real-time subscription
    const channel = supabase.channel(`chat:${chatId}`);

    channel
      .on(
        "postgres_changes" as any, // Type assertion needed due to Supabase typing issue
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          const newMessage = payload.new as Message;
          if (newMessage) {
            setMessages((prev) => {
              // Check if message already exists
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
  }, [chatId]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({ chat_id: chatId, sender: "user", content: text })
        .select("id, sender, content, timestamp")
        .single();

      if (error) {
        throw error;
      }

      setMessages((prev) => [...prev, data]);

      // Now send to AI for response
      console.log("Sending request to AI endpoint:", {
        prompt: text,
        model: "gpt-4-0125-preview", // Using a specific model
        thoughtMode: "chain",
      });

      const aiResponse = await fetch("/api/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: text,
          model: "gpt-4-0125-preview",
          thoughtMode: "chain",
        }),
      });

      const aiData = await aiResponse.json();
      console.log("Received AI response:", aiData);

      if (!aiResponse.ok) {
        throw new Error(aiData.error || "Failed to get AI response");
      }

      // The response contains a parsed JSON object with steps and finalAnswer
      console.log("AI response structure:", {
        steps: aiData.response.steps,
        finalAnswer: aiData.response.finalAnswer,
      });

      // Insert AI response into Supabase
      const { data: botData, error: botError } = await supabase
        .from("messages")
        .insert({
          chat_id: chatId,
          sender: "bot",
          content: JSON.stringify(aiData.response),
        })
        .select("id, sender, content, timestamp")
        .single();

      if (botError) {
        throw botError;
      }

      console.log("Saved bot response to Supabase:", botData);
      setMessages((prev) => [...prev, botData]);
    } catch (error) {
      console.error("Error in chat sequence:", error);
    } finally {
      setLoading(false);
    }
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
