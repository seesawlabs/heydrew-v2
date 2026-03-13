"use client";

import { useRouter } from "next/navigation";
import { useProfileStore } from "@/lib/stores/useProfileStore";
import { useDashboardStore, useTaxUploadUnlocked } from "@/lib/stores/useDashboardStore";
import { CheckboxBrutal } from "@/components/ui/checkbox-brutal";

function formatMoney(n: number) {
  return "$" + n.toLocaleString("en-US");
}

export default function DashboardPage() {
  const router = useRouter();
  const { business, personal } = useProfileStore();
  const {
    augustaCompleted,
    augustaSavings,
    checklistPaidSelf,
    checklistAccountingUpdated,
    toggleChecklist,
  } = useDashboardStore();
  const taxUploadUnlocked = useTaxUploadUnlocked();

  const firstName = personal.fullName.split(" ")[0] || "there";

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {/* Header */}
      <div
        style={{
          maxWidth: 540,
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/heydrew-logo.svg"
          alt="HeyDrew!"
          width={120}
          height={60}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Messages icon (placeholder) */}
          <button
            style={{
              width: 36,
              height: 36,
              border: "2px solid var(--black)",
              borderRadius: 10,
              background: "var(--white)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--black)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          {/* Settings icon (placeholder) */}
          <button
            style={{
              width: 36,
              height: 36,
              border: "2px solid var(--black)",
              borderRadius: 10,
              background: "var(--white)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--black)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          {/* Reset (small text) */}
          <button
            onClick={() => {
              if (confirm("Reset all data and start over?")) {
                localStorage.clear();
                router.push("/");
                window.location.reload();
              }
            }}
            style={{
              padding: "6px 10px",
              border: "2px solid var(--gray-300)",
              borderRadius: 10,
              background: "var(--white)",
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontSize: 9,
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "var(--gray-500)",
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "24px 24px 0" }}>
        {/* Welcome */}
        <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 11, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
          Welcome back
        </p>
        <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
          {firstName}
        </h1>

        {/* Business Card */}
        <div style={{ border: "2px solid var(--black)", borderRadius: 12, boxShadow: "4px 4px 0px var(--black)", marginBottom: 24 }}>
          <div style={{ background: "var(--black)", padding: "12px 16px", borderRadius: "10px 10px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--white)" }}>
              {business.name}
            </span>
            <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 11, fontWeight: 700, color: "var(--gray-400)", border: "1px solid var(--gray-600)", borderRadius: 6, padding: "2px 8px" }}>
              {business.taxYear}
            </span>
          </div>
          <div style={{ padding: "8px 16px", background: "var(--white)", borderRadius: "0 0 10px 10px" }}>
            <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 11, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 1 }}>
              {business.type} / {business.industry}
            </span>
          </div>
        </div>

        {/* ===================== PRE-AUGUSTA STATE ===================== */}
        {!augustaCompleted && (
          <div
            style={{
              border: "2px solid var(--black)",
              borderRadius: 12,
              boxShadow: "4px 4px 0px var(--black)",
              background: "var(--white)",
              overflow: "hidden",
              marginBottom: 24,
            }}
          >
            {/* Qualification header */}
            <div style={{ padding: "16px 20px", borderBottom: "2px solid var(--black)", background: "var(--background)" }}>
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--gray-500)", marginBottom: 4 }}>
                Based on your business profile
              </p>
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 15, fontWeight: 700 }}>
                You likely qualify for a tax strategy
              </p>
            </div>

            {/* Augusta Rule card */}
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  border: "2px solid var(--black)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  A
                </div>
                <div>
                  <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, textTransform: "uppercase" }}>
                    The Augusta Rule
                  </p>
                  <p style={{ fontSize: 13, color: "var(--gray-500)" }}>
                    Section 280A(g) of the tax code
                  </p>
                </div>
              </div>

              <p style={{ fontSize: 14, color: "var(--gray-600)", lineHeight: 1.6, marginBottom: 16 }}>
                Rent your personal home to {business.type === "Sole proprietorship" ? "your business" : business.name} for
                meetings and events — up to 14 days per year, tax-free. Drew will walk you through it and generate
                all the compliance docs you need.
              </p>

              <button
                onClick={() => router.push("/augusta")}
                className="btn-brutal"
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  background: "var(--black)",
                  color: "var(--white)",
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Chat with Drew &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ===================== POST-AUGUSTA STATE ===================== */}
        {augustaCompleted && (
          <>
            {/* Stats Row */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, border: "2px solid var(--black)", borderRadius: 12, padding: "14px 16px", textAlign: "center", background: "var(--white)" }}>
                <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 10, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                  Strategies
                </p>
                <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 28, fontWeight: 700 }}>
                  1
                </p>
              </div>
              <div style={{ flex: 1, border: "2px solid var(--black)", borderRadius: 12, padding: "14px 16px", textAlign: "center", background: "var(--white)" }}>
                <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 10, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                  Savings
                </p>
                <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 28, fontWeight: 700 }}>
                  {formatMoney(augustaSavings)}
                </p>
              </div>
            </div>

            {/* Augusta Rule — completed */}
            <div
              style={{
                border: "2px solid var(--black)",
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                background: "var(--white)",
              }}
              onClick={() => router.push("/augusta")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, border: "2px solid var(--black)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, fontWeight: 700 }}>
                  A
                </div>
                <div>
                  <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>
                    Augusta Rule
                  </p>
                  <p style={{ fontSize: 12, color: "var(--gray-500)" }}>
                    Saving {formatMoney(augustaSavings)}/yr
                  </p>
                </div>
              </div>
              <span style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 10px",
                border: "2px solid var(--black)",
                borderRadius: 8,
                background: "var(--black)",
                color: "var(--white)",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}>
                Done
              </span>
            </div>

            {/* Next Steps Checklist */}
            <div style={{ marginBottom: 40 }}>
              <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                Next Steps
              </h3>
              <div style={{ border: "2px solid var(--black)", borderRadius: 12, padding: "4px 16px", background: "var(--white)" }}>
                <CheckboxBrutal
                  checked={checklistPaidSelf}
                  onChange={() => toggleChecklist("checklistPaidSelf")}
                  label={`I've paid myself ${formatMoney(augustaSavings)}`}
                />
                <div style={{ height: 2, background: "var(--black)" }} />
                <CheckboxBrutal
                  checked={checklistAccountingUpdated}
                  onChange={() => toggleChecklist("checklistAccountingUpdated")}
                  label="My accounting records are up to date"
                />
              </div>

              {taxUploadUnlocked && (
                <div style={{ marginTop: 16 }}>
                  <button className="btn-primary" onClick={() => router.push("/taxes")}>
                    Upload Tax Documents
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
