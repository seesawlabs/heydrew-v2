"use client";

import { useEffect, useState } from "react";

const DOCUMENTS = [
  "Rental Agreement",
  "Meeting Agendas",
  "Meeting Minutes",
  "Rate Justification Memo",
  "Calendar Tracker",
];

const STAGGER_MS = 400;

interface DocGenerationProgressProps {
  onComplete: () => void;
}

export function DocGenerationProgress({
  onComplete,
}: DocGenerationProgressProps) {
  const [completed, setCompleted] = useState<number>(0);

  useEffect(() => {
    if (completed >= DOCUMENTS.length) {
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCompleted((c) => c + 1), STAGGER_MS);
    return () => clearTimeout(t);
  }, [completed, onComplete]);

  return (
    <div className="pl-11">
      <div className="bg-white border-2 border-black rounded-xl card-brutal p-5 space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
          <p className="font-heading text-heading-sm text-black">
            Generating your documents...
          </p>
        </div>

        {DOCUMENTS.map((name, i) => (
          <div
            key={name}
            className={`flex items-center gap-3 transition-opacity duration-300 ${
              i <= completed ? "opacity-100" : "opacity-30"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                i < completed
                  ? "bg-yellow border-2 border-black text-black scale-100"
                  : "bg-sage border-2 border-black text-charcoal/60 scale-90"
              }`}
            >
              {i < completed ? "✓" : "·"}
            </div>
            <span className="text-body-sm text-black">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
