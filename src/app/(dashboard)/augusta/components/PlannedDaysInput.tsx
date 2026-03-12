"use client";

import { useState } from "react";

interface PlannedDaysInputProps {
  onSubmit: (days: number) => void;
  disabled?: boolean;
}

export function PlannedDaysInput({ onSubmit, disabled }: PlannedDaysInputProps) {
  const [days, setDays] = useState(4);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (days < 1) {
      setError("You need at least 1 day.");
      return;
    }
    if (days > 14) {
      setError("The Augusta Rule caps at 14 days. Please adjust.");
      return;
    }
    setError("");
    onSubmit(days);
  };

  return (
    <form onSubmit={handleSubmit} className="pl-11 space-y-3">
      <div className="bg-white border-2 border-black rounded-xl card-brutal p-4 space-y-3">
        <label className="block text-label text-black font-body font-medium">
          How many days are you planning to use your home for business purposes this tax year?
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={14}
            value={days}
            onChange={(e) => {
              setDays(Number(e.target.value));
              setError("");
            }}
            disabled={disabled}
            className="w-24 px-3 py-2.5 min-h-[44px] bg-yellow border-2 border-black rounded-xl
              text-black text-body-md text-center
              focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
              disabled:opacity-50"
          />
          <span className="text-body-sm text-charcoal/60">of 14 days maximum</span>
        </div>
        {error && <p className="text-body-sm text-red-primary">{error}</p>}
        {days > 14 && (
          <p className="text-body-sm text-yellow-500">
            The Augusta Rule caps at 14 days. Would you like to adjust your plan?
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="px-6 py-2.5 min-h-[44px] bg-black text-white rounded-xl
          font-body text-body-sm font-semibold btn-brutal
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-150"
      >
        Continue
      </button>
    </form>
  );
}
