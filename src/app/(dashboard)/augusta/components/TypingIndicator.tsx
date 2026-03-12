"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 max-w-[85%]">
      <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shrink-0 border-2 border-black">
        <span className="text-yellow text-sm font-bold font-heading">D</span>
      </div>
      <div className="bg-white border-2 border-black rounded-xl px-4 py-3">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
