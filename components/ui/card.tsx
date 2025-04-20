import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
}

Card.Content = function CardContent({ children, className }: CardProps) {
  return <div className={`p-6 ${className || ""}`}>{children}</div>;
};
