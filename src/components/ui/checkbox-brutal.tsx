"use client";

interface CheckboxBrutalProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

export function CheckboxBrutal({ checked, onChange, label }: CheckboxBrutalProps) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        cursor: "pointer",
        padding: "12px 0",
      }}
    >
      <div
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        style={{
          width: 22,
          height: 22,
          border: "3px solid var(--black)",
          borderRadius: 12,
          background: checked ? "var(--black)" : "var(--white)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: "pointer",
          marginTop: 1,
        }}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--black)",
          lineHeight: 1.4,
        }}
      >
        {label}
      </span>
    </label>
  );
}
