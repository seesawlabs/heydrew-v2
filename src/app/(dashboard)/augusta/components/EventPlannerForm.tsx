"use client";

import { useState } from "react";
import type { PlannedEvent } from "../hooks/useAugustaFlow";

interface EventPlannerFormProps {
  totalDays: number;
  businessPurposes: string[];
  onSubmit: (events: PlannedEvent[]) => void;
  disabled?: boolean;
}

function makeId() {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function emptyEvent(purposes: string[]): PlannedEvent {
  return {
    id: makeId(),
    type: purposes[0] || "",
    date: "",
    days: 1,
    attendees: 2,
    description: "",
  };
}

export function EventPlannerForm({
  totalDays,
  businessPurposes,
  onSubmit,
  disabled,
}: EventPlannerFormProps) {
  const [events, setEvents] = useState<PlannedEvent[]>(() => [emptyEvent(businessPurposes)]);

  const daysUsed = events.reduce((sum, e) => sum + e.days, 0);
  const daysRemaining = totalDays - daysUsed;

  const updateEvent = (id: string, field: keyof PlannedEvent, value: string | number) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const addEvent = () => {
    if (daysRemaining > 0) {
      setEvents((prev) => [...prev, emptyEvent(businessPurposes)]);
    }
  };

  const removeEvent = (id: string) => {
    if (events.length > 1) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // Debug: log event state to help diagnose validation issues
  if (typeof window !== "undefined") {
    console.log("[EventPlanner] events state:", events.map((e) => ({
      id: e.id,
      type: e.type,
      date: e.date,
      days: e.days,
      attendees: e.attendees,
      typeOk: !!e.type,
      dateOk: !!e.date,
      attendeesOk: e.attendees >= 1,
      daysOk: e.days >= 1,
    })));
  }

  const allValid =
    events.every((e) => e.type && e.date && e.attendees >= 1 && e.days >= 1) &&
    daysUsed <= totalDays &&
    daysUsed > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (allValid) onSubmit(events);
  };

  // Max days this event can use = its current days + whatever is remaining
  const maxDaysForEvent = (event: PlannedEvent) => {
    const otherDays = events
      .filter((e) => e.id !== event.id)
      .reduce((sum, e) => sum + e.days, 0);
    return totalDays - otherDays;
  };

  return (
    <form onSubmit={handleSubmit} className="pl-11 space-y-3">
      <div className="bg-white border-2 border-black rounded-xl card-brutal p-4 space-y-4">
        {/* Header with day counter */}
        <div className="flex items-center justify-between">
          <p className="text-label text-black font-body font-medium">Plan your events</p>
          <div className="flex items-center gap-2">
            <span
              className={`text-body-sm font-semibold ${
                daysUsed === totalDays
                  ? "text-black"
                  : daysUsed > totalDays
                    ? "text-red-primary"
                    : "text-charcoal/60"
              }`}
            >
              {daysUsed} / {totalDays} days
            </span>
            {/* Progress bar */}
            <div className="w-20 h-2 bg-sage rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  daysUsed > totalDays ? "bg-red-primary" : "bg-black"
                }`}
                style={{ width: `${Math.min((daysUsed / totalDays) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {daysUsed > totalDays && (
          <p className="text-subtext-sm text-red-primary">
            You&apos;ve planned {daysUsed - totalDays} more day{daysUsed - totalDays > 1 ? "s" : ""} than allowed. Remove days to continue.
          </p>
        )}

        {events.map((event, idx) => (
          <div
            key={event.id}
            className="border-2 border-black rounded-xl bg-white p-3 space-y-3 relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-label text-charcoal/60">Event {idx + 1}</span>
              {events.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEvent(event.id)}
                  className="px-2.5 py-1 text-subtext-sm font-medium text-red-primary bg-red-light border-2 border-red-primary rounded-xl
                    hover:bg-red-primary hover:text-white transition-colors duration-150"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-subtext-sm text-charcoal/70 font-body font-medium mb-1">Event type</label>
                <select
                  value={event.type}
                  onChange={(e) => updateEvent(event.id, "type", e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2.5 min-h-[44px] bg-yellow border-2 border-black rounded-xl
                    text-body-sm text-black
                    focus:outline-none focus:ring-2 focus:ring-black
                    disabled:opacity-50"
                >
                  <option value="">Select...</option>
                  {businessPurposes.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-subtext-sm text-charcoal/70 font-body font-medium mb-1">Start date</label>
                <input
                  type="date"
                  value={event.date}
                  onChange={(e) => updateEvent(event.id, "date", e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2.5 min-h-[44px] bg-yellow border-2 border-black rounded-xl
                    text-body-sm text-black
                    focus:outline-none focus:ring-2 focus:ring-black
                    disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-subtext-sm text-charcoal/70 font-body font-medium mb-1">Days</label>
                <input
                  type="number"
                  min={1}
                  max={maxDaysForEvent(event)}
                  value={event.days || ""}
                  onChange={(e) => updateEvent(event.id, "days", e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)))}
                  disabled={disabled}
                  className="w-full px-3 py-2.5 min-h-[44px] bg-yellow border-2 border-black rounded-xl
                    text-body-sm text-black
                    focus:outline-none focus:ring-2 focus:ring-black
                    disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-subtext-sm text-charcoal/70 font-body font-medium mb-1">Attendees</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={event.attendees}
                  onChange={(e) => updateEvent(event.id, "attendees", Number(e.target.value))}
                  disabled={disabled}
                  className="w-full px-3 py-2.5 min-h-[44px] bg-yellow border-2 border-black rounded-xl
                    text-body-sm text-black
                    focus:outline-none focus:ring-2 focus:ring-black
                    disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-subtext-sm text-charcoal/70 font-body font-medium mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={event.description}
                onChange={(e) => updateEvent(event.id, "description", e.target.value)}
                placeholder="Brief purpose..."
                disabled={disabled}
                className="w-full px-3 py-2.5 min-h-[44px] bg-yellow border-2 border-black rounded-xl
                  text-body-sm text-black placeholder:text-charcoal/40
                  focus:outline-none focus:ring-2 focus:ring-black
                  disabled:opacity-50"
              />
            </div>
          </div>
        ))}

        {daysRemaining > 0 && (
          <button
            type="button"
            onClick={addEvent}
            disabled={disabled}
            className="text-black text-body-sm font-semibold btn-brutal bg-white border-2 border-black rounded-xl px-3 py-1.5 hover:bg-yellow transition-colors"
          >
            + Add another event ({daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining)
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={disabled || !allValid}
        className="px-6 py-2.5 min-h-[44px] bg-black text-white rounded-xl
          font-body text-body-sm font-semibold btn-brutal
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-150"
      >
        Review my plan
      </button>
      {!allValid && events.length > 0 && (
        <p className="text-subtext-xs text-charcoal/60 pl-1">
          {daysUsed > totalDays
            ? `Remove ${daysUsed - totalDays} day${daysUsed - totalDays > 1 ? "s" : ""} to continue`
            : daysUsed === 0
              ? "Add at least 1 day to an event"
              : (() => {
                  const missing = events
                    .map((e, i) => {
                      const issues: string[] = [];
                      if (!e.type) issues.push("type");
                      if (!e.date) issues.push("date");
                      if (e.attendees < 1) issues.push("attendees");
                      if (e.days < 1) issues.push("days");
                      return issues.length > 0 ? `Event ${i + 1}: ${issues.join(", ")}` : null;
                    })
                    .filter(Boolean);
                  return missing.length > 0
                    ? `Missing: ${missing.join("; ")}`
                    : null;
                })()}
        </p>
      )}
    </form>
  );
}
