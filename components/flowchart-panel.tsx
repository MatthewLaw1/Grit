"use client";

import { useEffect, useRef, useState } from "react";
import { Markmap } from "markmap-view";
import { Transformer } from "markmap-lib";
import { X, Eye, EyeOff } from "lucide-react";
import { Message } from "./chat-panel";

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

interface FlowchartPanelProps {
  onClose: () => void;
  messages: Message[];
  parseMessage: (msg: Message) => ParsedMessage;
  focusedStepId?: string;
}

const transformer = new Transformer();

export default function FlowchartPanel({
  onClose,
  messages,
  parseMessage,
  focusedStepId,
}: FlowchartPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);
  const [showSubDetails, setShowSubDetails] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    // Initialize Markmap if not already done
    if (!mmRef.current) {
      mmRef.current = Markmap.create(svgRef.current);
    }

    // Convert messages to markdown structure
    const markdown = generateMarkdown(
      messages,
      parseMessage,
      focusedStepId,
      showSubDetails
    );

    // Transform markdown to markmap data
    const { root } = transformer.transform(markdown);

    // Render the markmap
    mmRef.current.setData(root);
    mmRef.current.fit();
  }, [messages, parseMessage, focusedStepId, showSubDetails]);

  return (
    <div className="flex-1 flex flex-col bg-[var(--secondary)] rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 bg-[var(--secondary)]">
        <h2 className="font-bold text-xl text-white">
          {focusedStepId
            ? "Exploring Reasoning Step"
            : "Thought Process Visualization"}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSubDetails(!showSubDetails)}
            className="text-white p-1 rounded-full hover:bg-[var(--background)] flex items-center gap-1"
            title={showSubDetails ? "Hide sub-details" : "Show sub-details"}
          >
            {showSubDetails ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button
            onClick={onClose}
            className="text-white p-1 rounded-full hover:bg-[var(--background)]"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-white">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{
            backgroundColor: "var(--background)",
            color: "var(--primary)",
          }}
        />
      </div>
    </div>
  );
}

function generateMarkdown(
  messages: Message[],
  parseMessage: (msg: Message) => ParsedMessage,
  focusedStepId?: string,
  showSubDetails: boolean = false
): string {
  // If focusing on a specific step
  if (focusedStepId) {
    let markdown = "";

    // Find the original message containing this step
    let originalMessage: Message | undefined;
    let targetStep: Step | undefined;

    for (const msg of messages) {
      const parsed = parseMessage(msg);
      if (parsed.steps) {
        const step = parsed.steps.find((s) => s.id === focusedStepId);
        if (step) {
          originalMessage = msg;
          targetStep = step;
          break;
        }
      }
    }

    if (targetStep) {
      markdown += `\n## 🔍 Exploring Goal: ${targetStep.goal}\n`;
      markdown += `  - 🤔 Reasoning: ${targetStep.reasoning}\n`;
      markdown += `  - ✨ Conclusion: ${targetStep.conclusion}\n`;

      // Get all exploration messages for this step
      const explorationMessages = messages.filter((msg) => {
        const parsed = parseMessage(msg);
        return parsed.parentStepId === focusedStepId;
      });

      if (explorationMessages.length > 0) {
        markdown += `\n## 🔄 Exploration Thread\n`;
        let currentUserQuestion = "";
        let currentAiResponse = null;

        explorationMessages.forEach((expMsg) => {
          const expParsed = parseMessage(expMsg);
          if (expMsg.sender === "user") {
            currentUserQuestion = expParsed.content;
          } else {
            currentAiResponse = expParsed;
            if (currentUserQuestion && currentAiResponse) {
              markdown += `- ❓ Question: ${currentUserQuestion}\n`;
              markdown += `  - 💡 Answer: ${currentAiResponse.content}\n`;
              if (showSubDetails && currentAiResponse.steps) {
                currentAiResponse.steps.forEach((expStep) => {
                  markdown += `  - 🎯 Sub-Goal: ${expStep.goal}\n`;
                  markdown += `    - 🤔 Sub-Reasoning: ${expStep.reasoning}\n`;
                  markdown += `    - ✨ Sub-Conclusion: ${expStep.conclusion}\n`;
                });
              }
              currentUserQuestion = "";
              currentAiResponse = null;
            }
          }
        });
      }

      return markdown;
    }
  }

  // Default full visualization
  let markdown = "# 💭 Thought Process\n";

  const messageTree = new Map<string | undefined, Message[]>();
  messages.forEach((msg) => {
    const parsed = parseMessage(msg);
    const parentId = parsed.parentStepId;
    if (!messageTree.has(parentId)) {
      messageTree.set(parentId, []);
    }
    messageTree.get(parentId)?.push(msg);
  });

  const mainMessages = messageTree.get(undefined) || [];
  let conversationCount = 1;

  mainMessages.forEach((msg) => {
    const parsed = parseMessage(msg);

    if (msg.sender === "user") {
      markdown += `\n## 👤 ${parsed.content}\n`;
    } else if (msg.sender === "bot" && parsed.steps) {
      markdown += `\n## 🤖 ${parsed.content}\n`;
      markdown += `\n## 🔄 Reasoning Steps\n`;

      parsed.steps.forEach((step) => {
        markdown += ` - 🎯 Goal: ${step.goal}\n`;
        markdown += `   - 🤔 Reasoning: ${step.reasoning}\n`;
        markdown += `   - ✨ Conclusion: ${step.conclusion}\n`;

        const explorationMessages = messageTree.get(step.id) || [];
        if (explorationMessages.length > 0) {
          markdown += `   - 🔍 Further Exploration\n`;
          let currentUserQuestion = "";
          let currentAiResponse = null;

          explorationMessages.forEach((expMsg) => {
            const expParsed = parseMessage(expMsg);
            if (expMsg.sender === "user") {
              currentUserQuestion = expParsed.content;
            } else {
              currentAiResponse = expParsed;
              if (currentUserQuestion && currentAiResponse) {
                markdown += `     - ❓ Question: ${currentUserQuestion}\n`;
                markdown += `       - 💡 Answer: ${currentAiResponse.content}\n`;
                if (showSubDetails && currentAiResponse.steps) {
                  currentAiResponse.steps.forEach((expStep) => {
                    markdown += `         - 🎯 Sub-Goal: ${expStep.goal}\n`;
                    markdown += `           - 🤔 Sub-Reasoning: ${expStep.reasoning}\n`;
                    markdown += `           - ✨ Sub-Conclusion: ${expStep.conclusion}\n`;
                  });
                }
                currentUserQuestion = "";
                currentAiResponse = null;
              }
            }
          });
        }
      });
      conversationCount++;
    }
  });

  return markdown;
}
