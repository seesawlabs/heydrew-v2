"use client";

interface SuggestionChipsProps {
  chips: string[];
  onSelect: (chip: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({ chips, onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 pl-11">
      {chips.map((chip) => (
        <button
          key={chip}
          onClick={() => onSelect(chip)}
          disabled={disabled}
          className="px-4 py-2.5 min-h-[44px] bg-white text-black border-2 border-black rounded-xl
            font-body text-body-sm font-semibold btn-brutal
            hover:translate-y-[2px] hover:shadow-none
            active:translate-y-[2px] active:shadow-none
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-150"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
