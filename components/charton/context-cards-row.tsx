"use client";

import { ContextCard } from "./context-card";

interface ContextCardsRowProps {
  cards: { title: string; body: string }[];
  onUpdate: (cardIndex: number, title: string, body: string) => void;
}

export function ContextCardsRow({ cards, onUpdate }: ContextCardsRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 shrink-0">
      {cards.map((card, index) => (
        <ContextCard
          key={index}
          cardIndex={index}
          title={card.title}
          body={card.body}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
