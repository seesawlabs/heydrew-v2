"use client";

import { useState, useEffect } from "react";
import type { PropertyDetails } from "../hooks/useAugustaFlow";

interface PropertyDetailsFormProps {
  onSubmit: (details: PropertyDetails) => void;
  disabled?: boolean;
  initialValues?: Partial<PropertyDetails>;
  loading?: boolean;
}

const AMENITY_OPTIONS = [
  "Pool",
  "Hot tub",
  "Outdoor kitchen / grill",
  "Home theater",
  "Large yard / patio",
  "Waterfront / view",
  "Game room",
  "Wine cellar",
];

export function PropertyDetailsForm({ onSubmit, disabled, initialValues, loading }: PropertyDetailsFormProps) {
  const [bedrooms, setBedrooms] = useState(initialValues?.bedrooms || 3);
  const [bathrooms, setBathrooms] = useState(initialValues?.bathrooms || 2);
  const [squareFeet, setSquareFeet] = useState(initialValues?.squareFeet || 2000);
  const [amenities, setAmenities] = useState<string[]>(initialValues?.amenities || []);
  // Update form when initialValues change (e.g. from property lookup)
  useEffect(() => {
    if (initialValues) {
      if (initialValues.bedrooms) setBedrooms(initialValues.bedrooms);
      if (initialValues.bathrooms) setBathrooms(initialValues.bathrooms);
      if (initialValues.squareFeet) setSquareFeet(initialValues.squareFeet);
      if (initialValues.amenities) setAmenities(initialValues.amenities);
    }
  }, [initialValues]);

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ bedrooms, bathrooms, squareFeet, amenities });
  };

  return (
    <form onSubmit={handleSubmit} className="pl-11 space-y-4">
      <div className="bg-white border-2 border-black rounded-xl card-brutal p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-label text-black font-body font-medium">
            {loading ? "Looking up your property…" : "Confirm your property details"}
          </p>
          {loading && (
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-subtext-sm text-charcoal/70 font-body font-medium mb-1">Bedrooms</label>
            <input
              type="number"
              min={1}
              max={20}
              value={bedrooms}
              onChange={(e) => setBedrooms(Number(e.target.value))}
              disabled={disabled}
              className="w-full px-3 py-2.5 min-h-[44px] bg-yellow border-2 border-black rounded-xl
                text-black text-body-md focus:outline-none focus:ring-2 focus:ring-black
                disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-subtext-sm text-charcoal/70 font-body font-medium mb-1">Bathrooms</label>
            <input
              type="number"
              min={1}
              max={20}
              step={0.5}
              value={bathrooms}
              onChange={(e) => setBathrooms(Number(e.target.value))}
              disabled={disabled}
              className="w-full px-3 py-2.5 min-h-[44px] bg-yellow border-2 border-black rounded-xl
                text-black text-body-md focus:outline-none focus:ring-2 focus:ring-black
                disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-subtext-sm text-charcoal/70 font-body font-medium mb-1">Sq ft</label>
            <input
              type="number"
              min={500}
              max={50000}
              step={1}
              value={squareFeet}
              onChange={(e) => setSquareFeet(Number(e.target.value))}
              disabled={disabled}
              className="w-full px-3 py-2.5 min-h-[44px] bg-yellow border-2 border-black rounded-xl
                text-black text-body-md focus:outline-none focus:ring-2 focus:ring-black
                disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-subtext-sm text-charcoal/70 font-body font-medium mb-2">
            Amenities (select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((amenity) => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-xl text-body-sm border-2 border-black transition-colors duration-150
                  ${
                    amenities.includes(amenity)
                      ? "bg-yellow text-black font-bold"
                      : "bg-white text-black"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="px-6 py-2.5 min-h-[44px] bg-black text-white rounded-xl
          font-body text-body-sm font-semibold btn-brutal
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-150"
      >
        Find comparable rates
      </button>
    </form>
  );
}
