"use client";

import { useState } from "react";

const CLIENT = {
  name: "Cal's Consulting",
  owner: "Calvin Locklear",
  type: "S-Corporation",
  industry: "Professional Services",
  taxYear: "2025",
  status: "Ready for Review",
};

const UPLOADED_DOCS = [
  { name: "Tax Return", file: "cal_1040_2025.pdf" },
  { name: "Business P&L", file: "cal_schedule_c_2025.pdf" },
  { name: "W-2", file: "cal_w2_2025.pdf" },
  { name: "1099-NEC", file: "cal_1099nec_2025.pdf" },
  { name: "Expenses", file: "cal_expenses_2025.xlsx" },
  { name: "Mortgage Statement", file: "cal_1098_2025.pdf" },
];

const PARSED_DOCS = [
  { name: "Schedule K-1 (Form 1065)", file: "parsed_k1_2025.pdf", desc: "Partner's share of income, deductions, credits" },
  { name: "Schedule SE", file: "parsed_schedule_se_2025.pdf", desc: "Self-employment tax calculation" },
  { name: "Form 8829", file: "parsed_8829_2025.pdf", desc: "Expenses for business use of home" },
  { name: "Form 4562", file: "parsed_4562_2025.pdf", desc: "Depreciation and amortization" },
  { name: "Augusta Rule Agreement", file: "parsed_augusta_rental_2025.pdf", desc: "Section 280A(g) rental documentation" },
  { name: "Schedule 1 (Form 1040)", file: "parsed_schedule1_2025.pdf", desc: "Additional income and adjustments" },
];

export default function AdminPage() {
  const [expanded, setExpanded] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ from: "admin" | "client"; text: string; time: string }[]>([]);
  const [newReply, setNewReply] = useState("");

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {/* Header */}
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/heydrew-logo.svg" alt="HeyDrew!" width={120} height={60} />
        <span style={{
          fontFamily: "'Cabinet Grotesk', sans-serif",
          fontSize: 10,
          fontWeight: 700,
          padding: "4px 10px",
          border: "2px solid var(--black)",
          borderRadius: 12,
          background: "var(--black)",
          color: "var(--white)",
          textTransform: "uppercase",
          letterSpacing: 1,
        }}>
          Admin
        </span>
      </div>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "24px 24px 0" }}>
        {/* Cases header */}
        <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Cases for Review
        </h2>

        {/* Client card — collapsible */}
        <div style={{ border: "2px solid var(--black)", borderRadius: 12, boxShadow: "4px 4px 0px var(--black)", marginBottom: 24 }}>
          <div
            onClick={() => setExpanded(!expanded)}
            style={{ background: "var(--black)", padding: "12px 16px", borderRadius: expanded ? "10px 10px 0 0" : 10, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--white)" }}>
                {CLIENT.name}
              </span>
            </div>
            <span style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              border: "1px solid var(--gray-600)",
              borderRadius: 6,
              color: "#4CD964",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}>
              {CLIENT.status}
            </span>
          </div>
          {expanded && (
            <div style={{ padding: "12px 16px", background: "var(--white)", borderRadius: "0 0 10px 10px" }}>
              <div style={{ display: "flex", gap: 24 }}>
                <div>
                  <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 9, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: 1 }}>Owner</p>
                  <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700 }}>{CLIENT.owner}</p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 9, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: 1 }}>Type</p>
                  <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700 }}>{CLIENT.type}</p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 9, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: 1 }}>Tax Year</p>
                  <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700 }}>{CLIENT.taxYear}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {expanded && <>
        {/* Uploaded Documents */}
        <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Uploaded Documents
        </h3>
        <div style={{ border: "2px solid var(--black)", borderRadius: 12, marginBottom: 24 }}>
          {UPLOADED_DOCS.map((doc, i) => (
            <div
              key={doc.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderBottom: i < UPLOADED_DOCS.length - 1 ? "2px solid var(--black)" : "none",
                background: "var(--white)",
                borderRadius: i === 0 ? "10px 10px 0 0" : i === UPLOADED_DOCS.length - 1 ? "0 0 10px 10px" : 0,
              }}
            >
              <div>
                <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {doc.name}
                </p>
                <p style={{ fontSize: 11, color: "var(--gray-500)" }}>{doc.file}</p>
              </div>
              <button
                style={{
                  padding: "4px 12px",
                  border: "2px solid var(--black)",
                  borderRadius: 12,
                  background: "var(--white)",
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                View
              </button>
            </div>
          ))}
        </div>

        {/* Parsed Tax Data */}
        <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Parsed Tax Documents
        </h3>
        <div style={{ border: "2px solid var(--black)", borderRadius: 12, boxShadow: "4px 4px 0px var(--black)", marginBottom: 24 }}>
          {PARSED_DOCS.map((doc, i) => (
            <div
              key={doc.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderBottom: i < PARSED_DOCS.length - 1 ? "2px solid var(--black)" : "none",
                background: "var(--white)",
                borderRadius: i === 0 ? "10px 10px 0 0" : i === PARSED_DOCS.length - 1 ? "0 0 10px 10px" : 0,
              }}
            >
              <div>
                <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {doc.name}
                </p>
                <p style={{ fontSize: 11, color: "var(--gray-500)" }}>{doc.desc}</p>
              </div>
              <button
                style={{
                  padding: "4px 12px",
                  border: "2px solid var(--black)",
                  borderRadius: 12,
                  background: "var(--white)",
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  flexShrink: 0,
                }}
              >
                View
              </button>
            </div>
          ))}
        </div>

        {/* Messages */}
        <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          Messages
        </h3>
        <div style={{ marginBottom: 40 }}>
          {/* Message history */}
          {messages.length > 0 && (
            <div style={{ border: "2px solid var(--black)", borderRadius: 12, background: "var(--white)", padding: 16, marginBottom: 12 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: i < messages.length - 1 ? 16 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{
                      fontFamily: "'Cabinet Grotesk', sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      color: msg.from === "admin" ? "var(--black)" : "#4CD964",
                    }}>
                      {msg.from === "admin" ? "You (Admin)" : "Calvin Locklear"}
                    </span>
                    <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 9, color: "var(--gray-400)" }}>
                      {msg.time}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 13,
                    color: "var(--black)",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: msg.from === "admin" ? "var(--gray-100)" : "#E8F7F5",
                    border: msg.from === "admin" ? "1px solid var(--gray-200)" : "1px solid #B7E4D8",
                  }}>
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Compose */}
          <textarea
            value={messages.length === 0 ? message : newReply}
            onChange={(e) => messages.length === 0 ? setMessage(e.target.value) : setNewReply(e.target.value)}
            placeholder={messages.length === 0 ? "Type a message to Calvin..." : "Reply..."}
            style={{
              width: "100%",
              minHeight: 80,
              padding: "14px 16px",
              borderRadius: 12,
              border: "2px solid var(--black)",
              background: "var(--white)",
              fontFamily: "'Satoshi', sans-serif",
              fontSize: 14,
              color: "var(--black)",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <button
            className="btn-primary"
            style={{ marginTop: 12 }}
            disabled={!(messages.length === 0 ? message : newReply).trim()}
            onClick={() => {
              const text = messages.length === 0 ? message : newReply;
              const now = new Date();
              const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
              const newMessages = [...messages, { from: "admin" as const, text, time }];

              // Simulate client reply after a moment
              setMessages(newMessages);
              setMessage("");
              setNewReply("");

              setTimeout(() => {
                setMessages((prev) => [
                  ...prev,
                  {
                    from: "client" as const,
                    text: prev.length === 1
                      ? "Thanks for the heads up! I'll get that uploaded today."
                      : "Got it, will do!",
                    time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
                  },
                ]);
              }, 2000);
            }}
          >
            Send Message
          </button>
        </div>
        </>}
      </div>
    </div>
  );
}
