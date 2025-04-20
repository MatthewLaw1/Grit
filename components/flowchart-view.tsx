"use client";

import { useEffect, useRef } from "react";
import { Markmap } from "markmap-view";
import { Transformer } from "markmap-lib";
import { X } from "lucide-react";
import { Message } from "./chat-panel";

interface FlowchartPanelProps {
  onClose: () => void;
  messages: Message[];
  parseMessage: (msg: Message) => { content: string; steps?: Step[] };
}

interface Step {
  goal: string;
  reasoning: string;
  conclusion: string;
  id: string;
  parentId?: string;
}

const transformer = new Transformer();

export default function FlowchartPanel({
  onClose,
  messages,
  parseMessage,
}: FlowchartPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Initialize Markmap if not already done
    if (!mmRef.current) {
      mmRef.current = Markmap.create(svgRef.current);
    }

    // Convert messages to markdown structure
    const markdown = generateMarkdown(messages, parseMessage);

    // Transform markdown to markmap data
    const { root } = transformer.transform(markdown);

    // Render the markmap
    mmRef.current.setData(root);
    mmRef.current.fit();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-[var(--secondary)] rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 bg-[var(--secondary)]">
        <h2 className="font-bold text-xl text-[var(--primary)]">
          Thought Process Visualization
        </h2>
        <button
          onClick={onClose}
          className="text-[var(--primary)] p-1 rounded-full hover:bg-[var(--background)]"
        >
          <X size={20} />
        </button>
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
  parseMessage: (msg: Message) => { content: string; steps?: Step[] }
): string {
  let markdown = "# Conversation Flow\n";

  messages.forEach((msg, index) => {
    const parsed = parseMessage(msg);

    if (msg.sender === "user") {
      markdown += `\n## User Message ${index + 1}\n`;
      markdown += `- ${parsed.content}\n`;
    } else if (msg.sender === "bot" && parsed.steps) {
      markdown += `\n## AI Response ${index + 1}\n`;
      markdown += `- Final Answer: ${parsed.content}\n`;
      markdown += `- Reasoning Process\n`;

      parsed.steps.forEach((step) => {
        markdown += `  - Goal: ${step.goal}\n`;
        markdown += `    - Reasoning: ${step.reasoning}\n`;
        markdown += `    - Conclusion: ${step.conclusion}\n`;
      });
    }
  });

  return markdown;
}
