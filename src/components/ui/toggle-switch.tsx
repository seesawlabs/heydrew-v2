"use client";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 48,
          height: 26,
          border: "3px solid var(--black)",
          borderRadius: 12,
          background: checked ? "var(--black)" : "var(--white)",
          position: "relative",
          cursor: "pointer",
          flexShrink: 0,
          transition: "background 0.15s ease",
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            background: checked ? "var(--white)" : "var(--black)",
            position: "absolute",
            top: 2,
            left: checked ? 24 : 2,
            transition: "left 0.15s ease",
          }}
        />
      </div>
      {label && (
        <span style={{ fontSize: 14, color: "var(--black)", fontWeight: 500 }}>
          {label}
        </span>
      )}
    </label>
  );
}
