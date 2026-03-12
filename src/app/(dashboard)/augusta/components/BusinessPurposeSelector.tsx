"use client";

import { useState } from "react";

const PURPOSE_OPTIONS = [
  "Board meetings or corporate meetings",
  "Annual/quarterly strategy planning sessions",
  "Team retreats or off-sites",
  "Client meetings or events",
  "Holiday parties or team celebrations",
];

interface BusinessPurposeSelectorProps {
  onSubmit: (purposes: string[]) => void;
  disabled?: boolean;
}

export function BusinessPurposeSelector({ onSubmit, disabled }: BusinessPurposeSelectorProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [other, setOther] = useState("");

  const toggle = (purpose: string) => {
    setSelected((prev) =>
      prev.includes(purpose) ? prev.filter((p) => p !== purpose) : [...prev, purpose]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const all = [...selected];
    if (other.trim()) all.push(other.trim());
    onSubmit(all);
  };

  const hasSelection = selected.length > 0 || other.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="pl-11 space-y-3">
      <div className="bg-white border-2 border-black rounded-xl card-brutal p-4 space-y-3">
        <p className="text-label text-black font-body font-medium">
          What legitimate business reasons could you use your home for? Check all that apply:
        </p>
        <div className="space-y-2">
          {PURPOSE_OPTIONS.map((purpose) => (
            <label
              key={purpose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-black cursor-pointer transition-colors
                ${
                  selected.includes(purpose)
                    ? "bg-yellow text-black font-bold"
                    : "bg-white text-black"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                type="checkbox"
                checked={selected.includes(purpose)}
                onChange={() => toggle(purpose)}
                disabled={disabled}
                className="w-5 h-5 rounded accent-white"
              />
              <span className="text-body-sm text-black">{purpose}</span>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-subtext-sm text-charcoal/70 font-body font-medium mb-1">Other (optional)</label>
          <input
            type="text"
            value={other}
            onChange={(e) => setOther(e.target.value)}
            placeholder="Describe another business use..."
            disabled={disabled}
            className="w-full px-3 py-2.5 min-h-[44px] bg-yellow border-2 border-black rounded-xl
              text-black text-body-sm placeholder:text-charcoal/40
              focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
              disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={disabled || !hasSelection}
          className="px-6 py-2.5 min-h-[44px] bg-black text-white rounded-xl
            font-body text-body-sm font-semibold btn-brutal
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150"
        >
          Continue
        </button>
        <button
          type="button"
          onClick={() => onSubmit([])}
          disabled={disabled}
          className="px-6 py-2.5 min-h-[44px] text-charcoal/60 text-body-sm font-semibold
            hover:text-black transition-colors duration-150"
        >
          None of these apply
        </button>
      </div>
    </form>
  );
}
