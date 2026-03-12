"use client";

import { useRef } from "react";

interface FileUploadCardProps {
  label: string;
  status: "missing" | "uploaded" | "in-review" | "approved";
  fileName?: string;
  onUpload: (file: File) => void;
}

const statusConfig = {
  missing: { label: "MISSING", bg: "var(--white)", border: "var(--black)" },
  uploaded: { label: "UPLOADED", bg: "var(--gray-100)", border: "var(--black)" },
  "in-review": { label: "IN REVIEW", bg: "var(--gray-200)", border: "var(--black)" },
  approved: { label: "APPROVED", bg: "var(--black)", border: "var(--black)", color: "var(--white)" },
};

export function FileUploadCard({ label, status, fileName, onUpload }: FileUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const config = statusConfig[status];

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
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--black)", textTransform: "uppercase", letterSpacing: 0.5 }}>
          {label}
        </div>
        {fileName && (
          <div
            style={{
              fontSize: 11,
              color: "var(--gray-500)",
              marginTop: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {fileName}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontSize: 9,
            fontWeight: 700,
            padding: "3px 8px",
            border: `2px solid ${config.border}`,
            borderRadius: 12,
            background: config.bg,
            color: "color" in config ? config.color : "var(--black)",
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {config.label}
        </span>
        <button
          onClick={() => inputRef.current?.click()}
          style={{
            padding: "4px 12px",
            border: "2px solid var(--black)",
            borderRadius: 12,
            background: "var(--white)",
            color: "var(--black)",
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {status === "missing" ? "Upload" : "Replace"}
        </button>
        <input
          ref={inputRef}
          type="file"
          style={{ display: "none" }}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
