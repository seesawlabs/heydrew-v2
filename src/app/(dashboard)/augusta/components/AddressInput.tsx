"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Prediction {
  placeId: string;
  description: string;
}

interface AddressDetails {
  formattedAddress: string;
  streetNumber: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
}

interface AddressInputProps {
  onSubmit: (address: string, details?: AddressDetails) => void;
  disabled?: boolean;
}

export function AddressInput({ onSubmit, disabled }: AddressInputProps) {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selected, setSelected] = useState<AddressDetails | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchPredictions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/places?input=${encodeURIComponent(input)}`);
      const data = await res.json();
      if (data.predictions) {
        setPredictions(data.predictions);
        setIsOpen(data.predictions.length > 0);
        setHighlightIdx(-1);
      }
    } catch {
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelected(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(value), 300);
  };

  const selectPrediction = async (prediction: Prediction) => {
    setQuery(prediction.description);
    setIsOpen(false);
    setPredictions([]);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/places/details?place_id=${encodeURIComponent(prediction.placeId)}`
      );
      const details: AddressDetails = await res.json();
      setSelected(details);
      setQuery(details.formattedAddress);
    } catch {
      // Fall back to the description string
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || predictions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, predictions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIdx >= 0) {
      e.preventDefault();
      selectPrediction(predictions[highlightIdx]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const address = selected?.formattedAddress || query.trim();
    if (address) {
      onSubmit(address, selected || undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pl-11 space-y-3">
      <div
        ref={wrapperRef}
        className="bg-white border-2 border-black rounded-xl card-brutal p-4 relative"
      >
        <label className="block text-label text-black font-body font-medium mb-2">Home address</label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => predictions.length > 0 && setIsOpen(true)}
            placeholder="Start typing your address..."
            disabled={disabled}
            autoComplete="off"
            className="w-full px-3 py-2.5 min-h-[44px] bg-yellow border-2 border-black rounded-xl
              text-black text-body-md placeholder:text-charcoal/40
              focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
              disabled:opacity-50"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Predictions dropdown */}
        {isOpen && predictions.length > 0 && (
          <ul className="absolute left-0 right-0 mx-4 mt-1 bg-white border-2 border-black rounded-xl shadow-md z-10 max-h-60 overflow-y-auto">
            {predictions.map((p, idx) => (
              <li key={p.placeId}>
                <button
                  type="button"
                  onClick={() => selectPrediction(p)}
                  className={`w-full text-left px-3 py-2.5 text-body-sm transition-colors
                    ${idx === highlightIdx ? "bg-yellow text-black" : "text-black hover:bg-yellow"}`}
                >
                  {p.description}
                </button>
              </li>
            ))}
            <li className="px-3 py-1.5 text-subtext-xs text-charcoal/60 border-t border-black">
              Powered by Google
            </li>
          </ul>
        )}

        {/* Selected address details chip */}
        {selected && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selected.city && (
              <span className="inline-block px-2 py-0.5 bg-yellow border border-black text-black text-subtext-sm rounded-xl">
                {selected.city}
              </span>
            )}
            {selected.state && (
              <span className="inline-block px-2 py-0.5 bg-yellow border border-black text-black text-subtext-sm rounded-xl">
                {selected.state}
              </span>
            )}
            {selected.zip && (
              <span className="inline-block px-2 py-0.5 bg-yellow border border-black text-black text-subtext-sm rounded-xl">
                {selected.zip}
              </span>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={disabled || (!query.trim() && !selected)}
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
