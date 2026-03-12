"use client";

interface ProgressStepsProps {
  steps: string[];
  current: number;
}

export function ProgressSteps({ steps, current }: ProgressStepsProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, padding: "0 24px" }}>
      {steps.map((label, i) => (
        <div key={label} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 32,
                height: 32,
                border: "3px solid var(--black)",
                borderRadius: 12,
                background: i <= current ? "var(--black)" : "var(--white)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: i <= current ? "var(--white)" : "var(--black)",
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {i < current ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                color: i <= current ? "var(--black)" : "var(--gray-400)",
                whiteSpace: "nowrap",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                width: 40,
                height: 3,
                background: i < current ? "var(--black)" : "var(--gray-200)",
                marginBottom: 20,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
