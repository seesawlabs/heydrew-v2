"use client";

interface FileUploadCardProps {
  label: string;
  uploaded: boolean;
  onUpload: () => void;
}

export function FileUploadCard({ label, uploaded, onUpload }: FileUploadCardProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px",
        background: "var(--white)",
        border: "2px solid var(--black)",
        borderRadius: 12,
        marginBottom: -2,
      }}
    >
      <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--black)", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {!uploaded && (
          <span
            style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontSize: 9,
              fontWeight: 700,
              padding: "3px 8px",
              border: "2px solid var(--black)",
              borderRadius: 12,
              background: "var(--white)",
              color: "var(--black)",
              whiteSpace: "nowrap",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Missing
          </span>
        )}
        <button
          onClick={onUpload}
          style={{
            padding: "4px 12px",
            border: "2px solid var(--black)",
            borderRadius: 12,
            background: uploaded ? "#4CD964" : "var(--white)",
            color: uploaded ? "var(--white)" : "var(--black)",
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {uploaded ? "Uploaded" : "Upload"}
        </button>
      </div>
    </div>
  );
}
