"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Markmap } from "markmap-view";
import { transformer } from "@/lib/markmap";
import { Toolbar } from "markmap-toolbar";
import "markmap-toolbar/dist/style.css";

interface FlowchartPanelProps {
  onClose: () => void;
}

const initValue = `# Flowchart

- Topic 1
  - Subtopic A
  - Subtopic B
- Topic 2
  - Subtopic X
  - Subtopic Y
`;

function renderToolbar(mm: Markmap, wrapper: HTMLElement) {
  while (wrapper?.firstChild) wrapper.firstChild.remove();
  if (mm && wrapper) {
    const toolbar = new Toolbar();
    toolbar.attach(mm);
    toolbar.setItems(Toolbar.defaultItems);
    wrapper.append(toolbar.render());
  }
}

export default function FlowchartPanel({ onClose }: FlowchartPanelProps) {
  const [value, setValue] = useState(initValue);
  const refSvg = useRef<SVGSVGElement>(null);
  const refMm = useRef<Markmap>();
  const refToolbar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (refMm.current || !refSvg.current) return;
    const mm = Markmap.create(refSvg.current);
    refMm.current = mm;
    if (refToolbar.current) {
      renderToolbar(mm, refToolbar.current);
    }
  }, [refSvg.current]);

  useEffect(() => {
    const mm = refMm.current;
    if (!mm) return;
    const { root } = transformer.transform(value);
    mm.setData(root);
    mm.fit();
  }, [refMm.current, value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  return (
    <div className="flex-1 flex flex-col bg-[var(--secondary)] rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4">
        <h2 className="font-bold text-xl text-[var(--primary)]">Flowchart</h2>
        <button
          onClick={onClose}
          className="text-[var(--primary)] p-1 rounded-full hover:bg-[var(--foreground)]"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex bg-[var(--background)] overflow-hidden">
        <div className="w-1/3 p-4 border-r border-[var(--secondary)]">
          <textarea
            value={value}
            onChange={handleChange}
            className="w-full h-full p-4 bg-[var(--foreground)] rounded-lg border border-[var(--secondary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Enter markdown here..."
          />
        </div>

        <div className="flex-1 relative">
          <svg ref={refSvg} className="w-full h-full" />
          <div ref={refToolbar} className="absolute bottom-4 right-4" />
        </div>
      </div>
    </div>
  );
}
