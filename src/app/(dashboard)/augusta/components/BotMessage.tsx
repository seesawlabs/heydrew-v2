"use client";

interface BotMessageProps {
  content: string;
}

export function BotMessage({ content }: BotMessageProps) {
  return (
    <div className="flex items-start gap-3 max-w-[85%]">
      <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shrink-0 border-2 border-black">
        <span className="text-yellow text-sm font-bold font-heading">D</span>
      </div>
      <div className="bg-white border-2 border-black rounded-xl px-4 py-3">
        <p className="text-body-md text-black font-body whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
