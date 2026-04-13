"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextCardProps {
  cardIndex: number;
  title: string;
  body: string;
  onUpdate: (cardIndex: number, title: string, body: string) => void;
}

export function ContextCard({
  cardIndex,
  title,
  body,
  onUpdate,
}: ContextCardProps) {
  const [localTitle, setLocalTitle] = useState(title);
  const [localBody, setLocalBody] = useState(body);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalTitle(title);
    setLocalBody(body);
  }, [title, body]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [localBody]);

  const handleTitleChange = (val: string) => {
    setLocalTitle(val);
    onUpdate(cardIndex, val, localBody);
  };

  const handleBodyChange = (val: string) => {
    setLocalBody(val);
    onUpdate(cardIndex, localTitle, val);
  };

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-2xl p-5 transition-all duration-300",
        "bg-white border border-slate-200",
        "hover:border-blue-300",
        isFocused && "border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.08)]"
      )}
    >
      <div className="flex items-center gap-2">
        <Pencil
          className={cn(
            "w-3.5 h-3.5 shrink-0 transition-colors",
            isFocused ? "text-blue-600" : "text-slate-300"
          )}
        />
        <input
          type="text"
          value={localTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "w-full bg-transparent text-sm font-semibold text-slate-800 outline-none",
            "placeholder:text-slate-300",
            "border-b border-transparent focus:border-blue-300 transition-colors pb-0.5"
          )}
          placeholder="Card title..."
        />
      </div>
      <textarea
        ref={textareaRef}
        value={localBody}
        onChange={(e) => handleBodyChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        rows={2}
        className={cn(
          "w-full bg-transparent text-sm text-slate-500 outline-none resize-none",
          "placeholder:text-slate-300 leading-relaxed",
          "min-h-[3rem]"
        )}
        placeholder="Add context here..."
      />
    </div>
  );
}
