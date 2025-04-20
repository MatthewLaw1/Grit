"use client";

export interface Heading {
    id: number;
    title: string;
    subheading: string;
    created_at: string;
}

interface HeadingsListProps {
    headings: Heading[];
    selectedId?: number;
    onHeadingSelect: (h: Heading) => void;
}

export default function HeadingsList({
    headings,
    selectedId,
    onHeadingSelect,
    }: HeadingsListProps) {
    return (
        <div className="space-y-2">
        {headings.map((h) => {
            const isSelected = h.id === selectedId;
            return (
            <div
                key={h.id}
                onClick={() => onHeadingSelect(h)}
                className={`
                p-3 rounded-lg cursor-pointer transition
                ${isSelected
                    ? "bg-[var(--secondary)] border border-[var(--primary)] text-white"
                    : "bg-white border border-[var(--secondary)] hover:bg-[var(--foreground)]"
                }
                `}
            >
                <div className="flex justify-between">
                <span
                    className={`font-semibold ${
                    isSelected ? "text-white" : "text-[var(--primary)]"
                    }`}
                >
                    {h.title}
                </span>
                <span className="text-xs text-[var(--secondary)]">
                    {new Date(h.created_at).toLocaleDateString()}
                </span>
                </div>
                <p className="text-sm">
                {isSelected ? (
                    <span className="text-white">{h.subheading}</span>
                ) : (
                    <span className="text-[var(--primary)]">{h.subheading}</span>
                )}
                </p>
            </div>
            );
        })}
        </div>
    );
}
