import React, { useRef, useEffect } from "react";
import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SendHorizontal, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ReasoningStep } from "./flowchart-view";

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string, parentStepId?: string) => void;
  isLoading?: boolean;
  selectedStep?: ReasoningStep;
  onExploreStep: (stepId: string) => void;
  focusedStepId?: string;
  onReturnToMain: () => void;
  chatId: number;
  title: string;
  subheading: string;
  onClose: () => void;
}

interface ParsedMessage {
  content: string;
  steps?: {
    goal: string;
    reasoning: string;
    conclusion: string;
    id: string;
  }[];
  parentStepId?: string;
}

const parseMessage = (msg: Message): ParsedMessage => {
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

export default function ChatPanel({
  messages,
  onSendMessage,
  isLoading = false,
  selectedStep,
  onExploreStep,
  focusedStepId,
  onReturnToMain,
  title,
  subheading,
  onClose,
}: ChatPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textareaRef.current?.value.trim() || isLoading) return;

    onSendMessage(textareaRef.current.value, focusedStepId);
    textareaRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const renderExplorationContext = (parentStepId: string | undefined) => {
    if (!parentStepId) return null;

    const parentStep = messages
      .map(parseMessage)
      .find((m) => m.steps?.some((s) => s.id === parentStepId))
      ?.steps?.find((s) => s.id === parentStepId);

    if (!parentStep) return null;

    return (
      <div className="mb-2 text-sm text-muted-foreground border-l-2 border-muted pl-2">
        <div className="flex justify-between items-center">
          <p>Exploring step:</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReturnToMain}
            className="text-xs"
          >
            Return to main conversation
          </Button>
        </div>
        <p>
          <strong>Goal:</strong> {parentStep.goal}
        </p>
        <p>
          <strong>Reasoning:</strong> {parentStep.reasoning}
        </p>
        <p>
          <strong>Conclusion:</strong> {parentStep.conclusion}
        </p>
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{subheading}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const parsedMessage = parseMessage(message);
            const isExplorationMessage =
              parsedMessage.parentStepId === focusedStepId;

            // Only show messages that are either part of the main conversation (no parentStepId)
            // or are part of the current exploration
            if (
              focusedStepId &&
              !isExplorationMessage &&
              parsedMessage.parentStepId
            ) {
              return null;
            }

            return (
              <div key={message.id || index}>
                {renderExplorationContext(parsedMessage.parentStepId)}
                <div
                  className={cn(
                    "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                    message.sender === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {parsedMessage.content}
                  {message.sender === "bot" &&
                    parsedMessage.steps &&
                    !focusedStepId && (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <div className="text-sm font-medium mb-2">
                          Reasoning Steps:
                        </div>
                        {parsedMessage.steps.map((step) => (
                          <div key={step.id} className="mb-3 text-sm">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">
                                Goal: {step.goal}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onExploreStep(step.id)}
                                className="text-xs"
                              >
                                Explore this reasoning
                              </Button>
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
          })}
          {isLoading && (
            <div className="flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted">
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 flex gap-2">
        <Textarea
          ref={textareaRef}
          placeholder={
            focusedStepId
              ? "Ask about this reasoning step..."
              : "Type your message..."
          }
          className="min-h-[60px]"
          onKeyDown={handleKeyDown}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading}
          className="h-[60px] w-[60px]"
        >
          <SendHorizontal />
        </Button>
      </form>
    </Card>
  );
}
