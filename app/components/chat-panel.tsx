import * as React from "react"
import { Message } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SendHorizontal, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

// Define ReasoningStep interface here since it's not exported from flowchart-panel
interface ReasoningStep {
  goal: string
  reasoning: string
  conclusion: string
  id: string
  parentId?: string
}

interface ChatPanelProps {
  messages: Message[]
  onSendMessage: (text: string, stepId?: string) => void
  isLoading?: boolean
  chatId: number
  title: string
  subheading: string
  onClose: () => void
  onExploreStep: (stepId: string) => void
  onReturnToMain: () => void
  focusedStepId?: string
  selectedStep?: ReasoningStep
  parseMessage: (msg: Message) => ParsedMessage
}


interface ParsedMessage {
  content: string
  steps?: ReasoningStep[]
  stepId?: string
  parentStepId?: string
}

export default function ChatPanel({
  messages,
  onSendMessage,
  isLoading = false,
  title,
  subheading,
  onClose,
  onExploreStep,
  onReturnToMain,
  focusedStepId,
  selectedStep,
  parseMessage: messageParseFn
}: ChatPanelProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!textareaRef.current?.value.trim() || isLoading) return

    onSendMessage(textareaRef.current.value, focusedStepId)
    textareaRef.current.value = ""
  }

  const renderExplorationContext = (step: ReasoningStep) => {
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
          <strong>Goal:</strong> {step.goal}
        </p>
        <p>
          <strong>Reasoning:</strong> {step.reasoning}
        </p>
        <p>
          <strong>Conclusion:</strong> {step.conclusion}
        </p>
      </div>
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

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

      <div className="flex-1 p-4 overflow-auto">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const parsedMessage = messageParseFn(message)
            if (focusedStepId) {

              if (parsedMessage.parentStepId !== focusedStepId && parsedMessage.stepId !== focusedStepId) {
                return null;
              }
            } else {

              if (parsedMessage.parentStepId || parsedMessage.stepId) {
                return null;
              }
            }

            // Show exploration context only for the first message in the thread
            const isFirstMessage = messages.findIndex(m => {
              const parsed = messageParseFn(m);
              return parsed.parentStepId === focusedStepId;
            }) === index;

            return (
              <div key={message.id || index}>
                {selectedStep && isFirstMessage && renderExplorationContext(selectedStep)}
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
                    parsedMessage.steps && (
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
                                Explore this step
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
            )
          })}
          {isLoading && (
            <div className="flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm bg-muted">
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex gap-2">
        <Textarea
          ref={textareaRef}
          placeholder={focusedStepId ? "Ask about this step..." : "Type your message..."}
          className="min-h-[60px]"
          onKeyDown={handleKeyDown}
        />
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="h-[60px] w-[60px]"
        >
          <SendHorizontal />
        </Button>
      </form>
    </Card>
  )
}
