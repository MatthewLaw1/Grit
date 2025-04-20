"use client";

import { useEffect, useRef, useState } from "react";
import { Markmap, IMarkmapOptions } from "markmap-view";
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

// Configure Markmap transformer with HTML support
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

    // Initialize Markmap with HTML support
    if (!mmRef.current) {
      const options: Partial<IMarkmapOptions> = {
        nodeMinHeight: 16,
        spacingVertical: 5,
        spacingHorizontal: 80,
        autoFit: true,
        duration: 350,
        embedGlobalCSS: true,
        fitRatio: 0.95,
        maxWidth: 300,
        initialExpandLevel: -1, // expand all levels
        color: (node) => "inherit",
      };
      mmRef.current = Markmap.create(svgRef.current, options);
    }

    // Add click handler for expandable text
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("expandable-text")) {
        e.stopPropagation(); // Prevent node collapse/expand
        const isExpanded = target.classList.contains("expanded");
        const fullText = target.getAttribute("data-full");
        const truncatedText = target.getAttribute("data-truncated");

        if (isExpanded) {
          target.textContent = truncatedText;
          target.classList.remove("expanded");
        } else {
          target.textContent = fullText;
          target.classList.add("expanded");
        }

        // Refresh the markmap to adjust to new text size
        if (mmRef.current) {
          mmRef.current.fit();
        }
      }
    };

    svgRef.current.addEventListener("click", handleClick);

    // Add custom CSS for expandable text
    const style = document.createElement("style");
    style.textContent = `
      .markmap-node .expandable-text {
        cursor: pointer;
        text-decoration: underline dotted;
        color: inherit;
      }
      .markmap-node .expandable-text:hover {
        opacity: 0.8;
      }
      .markmap-node .expandable-text.expanded {
        text-decoration: none;
      }
    `;
    document.head.appendChild(style);

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

    return () => {
      if (svgRef.current) {
        svgRef.current.removeEventListener("click", handleClick);
      }
      style.remove();
    };
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

function truncateText(text: string, maxLength: number = 80): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

function wrapWithTooltip(text: string, maxLength: number = 80): string {
  if (text.length <= maxLength) return text;
  const truncated = truncateText(text, maxLength);
  // Create a clickable span with data attributes for the full text
  return `<span class="expandable-text" data-full="${text.replace(
    /"/g,
    "&quot;"
  )}" data-truncated="${truncated}">${truncated}</span>`;
}

function generateMarkdown(
  messages: Message[],
  parseMessage: (msg: Message) => ParsedMessage,
  focusedStepId?: string,
  showSubDetails: boolean = false
): string {
  if (focusedStepId) {
    let markdown = "";
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
      markdown += `\n## 🔍 Exploring Goal: ${wrapWithTooltip(
        targetStep.goal
      )}\n`;
      markdown += `  - 🤔 Reasoning: ${wrapWithTooltip(
        targetStep.reasoning,
        80
      )}\n`;
      markdown += `  - ✨ Conclusion: ${wrapWithTooltip(
        targetStep.conclusion
      )}\n`;

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
              markdown += `- ❓ Question: ${wrapWithTooltip(
                currentUserQuestion
              )}\n`;
              markdown += `  - 💡 Answer: ${wrapWithTooltip(
                currentAiResponse.content,
                80
              )}\n`;
              if (showSubDetails && currentAiResponse.steps) {
                currentAiResponse.steps.forEach((expStep) => {
                  markdown += `  - 🎯 Sub-Goal: ${wrapWithTooltip(
                    expStep.goal
                  )}\n`;
                  markdown += `    - 🤔 Sub-Reasoning: ${wrapWithTooltip(
                    expStep.reasoning,
                    80
                  )}\n`;
                  markdown += `    - ✨ Sub-Conclusion: ${wrapWithTooltip(
                    expStep.conclusion
                  )}\n`;
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

  mainMessages.forEach((msg) => {
    const parsed = parseMessage(msg);

    if (msg.sender === "user") {
      markdown += `\n## 👤 ${wrapWithTooltip(parsed.content)}\n`;
    } else if (msg.sender === "bot" && parsed.steps) {
      markdown += `\n## 🤖 ${wrapWithTooltip(parsed.content, 80)}\n`;
      markdown += `\n## 🔄 Reasoning Steps\n`;

      parsed.steps.forEach((step) => {
        markdown += ` - 🎯 Goal: ${wrapWithTooltip(step.goal)}\n`;
        markdown += `   - 🤔 Reasoning: ${wrapWithTooltip(
          step.reasoning,
          80
        )}\n`;
        markdown += `   - ✨ Conclusion: ${wrapWithTooltip(step.conclusion)}\n`;

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
                markdown += `     - ❓ Question: ${wrapWithTooltip(
                  currentUserQuestion
                )}\n`;
                markdown += `       - 💡 Answer: ${wrapWithTooltip(
                  currentAiResponse.content,
                  80
                )}\n`;
                if (showSubDetails && currentAiResponse.steps) {
                  currentAiResponse.steps.forEach((expStep) => {
                    markdown += `         - 🎯 Sub-Goal: ${wrapWithTooltip(
                      expStep.goal
                    )}\n`;
                    markdown += `           - 🤔 Sub-Reasoning: ${wrapWithTooltip(
                      expStep.reasoning,
                      80
                    )}\n`;
                    markdown += `           - ✨ Sub-Conclusion: ${wrapWithTooltip(
                      expStep.conclusion
                    )}\n`;
                  });
                }
                currentUserQuestion = "";
                currentAiResponse = null;
              }
            }
          });
        }
      });
    }
  });

  return markdown;
}
