"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDashboardStore, useTaxUploadUnlocked } from "@/lib/stores/useDashboardStore";
import { FileUploadCard } from "@/components/ui/file-upload-card";

const TAX_DOCUMENTS = [
  { id: "1040", label: "Tax Return" },
  { id: "schedule-c", label: "Business P&L" },
  { id: "w2", label: "W-2" },
  { id: "1099-nec", label: "1099-NEC" },
  { id: "expense-report", label: "Expenses" },
  { id: "1098", label: "Mortgage Statement" },
];

const PROGRESS_STEPS = ["Uploaded", "Ready for Review", "Filed"];

function formatMoney(n: number) {
  return "$" + n.toLocaleString("en-US");
}

export default function TaxesPage() {
  const router = useRouter();
  const taxUploadUnlocked = useTaxUploadUnlocked();
  const { uploads, setUploadStatus, removeUpload, augustaSavings, caseNumber, setCaseNumber } = useDashboardStore();

  useEffect(() => {
    if (!taxUploadUnlocked) {
      router.replace("/dashboard");
    }
  }, [taxUploadUnlocked, router]);

  const [processing, setProcessing] = useState(false);
  const [processingDone, setProcessingDone] = useState(!!caseNumber);

  if (!taxUploadUnlocked) return null;

  const uploadedCount = Object.keys(uploads).length;
  const allUploaded = uploadedCount >= TAX_DOCUMENTS.length;
  const currentStep = processingDone ? 1 : processing ? 1 : uploadedCount > 0 ? 0 : -1;

  const totalIncome = 185000;
  const businessExpenses = 42000;
  const standardDeduction = 14600;
  const augustaDeduction = augustaSavings;
  const taxableIncome = totalIncome - businessExpenses - standardDeduction - augustaDeduction;
  const estimatedTax = Math.round(taxableIncome * 0.24);

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {/* Header */}
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            width: 40,
            height: 40,
            border: "3px solid var(--black)",
            borderRadius: 12,
            background: "var(--white)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--black)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 16, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
          Tax Documents
        </h1>
      </div>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "24px 24px 0" }}>
        {/* Progress Stepper */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
          {PROGRESS_STEPS.map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", flex: i < PROGRESS_STEPS.length - 1 ? 1 : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    border: "3px solid var(--black)",
                    borderRadius: 12,
                    background: i <= currentStep ? "var(--black)" : "var(--white)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i < currentStep ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 11, fontWeight: 700, color: i <= currentStep ? "var(--white)" : "var(--black)" }}>
                      {i + 1}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 9, fontWeight: 700, color: i <= currentStep ? "var(--black)" : "var(--gray-400)", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: 1 }}>
                  {label}
                </span>
              </div>
              {i < PROGRESS_STEPS.length - 1 && (
                <div style={{ flex: 1, height: 3, background: i < currentStep ? "var(--black)" : "var(--gray-200)", margin: "0 8px", marginBottom: 18 }} />
              )}
            </div>
          ))}
        </div>

        {/* Source Documents */}
        <div style={{ marginBottom: 32, position: "relative" }}>
          <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Source Documents
          </h3>
          <div style={{ border: "3px solid var(--black)", borderRadius: 12, position: "relative" }}>
            {processing && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.85)",
                borderRadius: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                gap: 12,
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  border: "3px solid var(--gray-600)",
                  borderTop: "3px solid var(--white)",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
                <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--white)", textTransform: "uppercase", letterSpacing: 1 }}>
                  DocSumo magic happening...
                </p>
              </div>
            )}
            {TAX_DOCUMENTS.map((doc) => (
                <FileUploadCard
                  key={doc.id}
                  label={doc.label}
                  uploaded={!!uploads[doc.id]}
                  onUpload={() => {
                    if (uploads[doc.id]) {
                      removeUpload(doc.id);
                      setProcessingDone(false);
                    } else {
                      setUploadStatus(doc.id, { status: "uploaded", fileName: doc.label });
                    }
                  }}
                />
            ))}
          </div>

          {/* Extra upload options */}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              className="btn-secondary"
              style={{ flex: 1, padding: "10px 16px", fontSize: 11 }}
              onClick={() => {/* no-op for demo */}}
            >
              Bulk Upload
            </button>
            <button
              className="btn-secondary"
              style={{ flex: 1, padding: "10px 16px", fontSize: 11 }}
              onClick={() => {/* no-op for demo */}}
            >
              Upload Other Doc
            </button>
          </div>

          {/* Submit button — triggers DocSumo */}
          {!processingDone && uploadedCount > 0 && (
            <button
              className="btn-primary"
              style={{ marginTop: 12 }}
              onClick={() => {
                setProcessing(true);
                setTimeout(() => {
                  setProcessing(false);
                  setProcessingDone(true);
                  if (!caseNumber) {
                    const id = "HD-" + Math.random().toString(36).substring(2, 8).toUpperCase();
                    setCaseNumber(id);
                  }
                }, 3000);
              }}
            >
              Submit for Review
            </button>
          )}
        </div>

        {/* Secret admin link */}
        {processingDone && (
          <p style={{ textAlign: "center", marginBottom: 24 }}>
            <a
              href="/admin"
              target="_blank"
              style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 11, color: "var(--gray-400)", textDecoration: "underline", cursor: "pointer" }}
            >
              (secret admin view)
            </a>
          </p>
        )}

        {/* Case number card */}
        {processingDone && caseNumber && (
          <div style={{
            border: "2px solid var(--black)",
            borderRadius: 12,
            boxShadow: "4px 4px 0px var(--black)",
            padding: "16px 20px",
            marginBottom: 24,
            background: "var(--black)",
            textAlign: "center",
          }}>
            <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 10, fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              All set! Your case number
            </p>
            <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "var(--white)", letterSpacing: 2 }}>
              {caseNumber}
            </p>
          </div>
        )}

        {/* Tax Summary — only after processing completes */}
        {processingDone && <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Tax Summary (Draft)
          </h3>
          <div style={{ border: "3px solid var(--black)", borderRadius: 12, boxShadow: "4px 4px 0px var(--black)" }}>
            <div style={{ padding: 16 }}>
              <SummaryRow label="Total Income" value={formatMoney(totalIncome)} />
              <SummaryRow label="Business Expenses" value={`-${formatMoney(businessExpenses)}`} />
              <SummaryRow label="Standard Deduction" value={`-${formatMoney(standardDeduction)}`} />
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "2px solid var(--black)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700 }}>Augusta Rule</span>
                  <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 9, fontWeight: 700, padding: "1px 6px", border: "2px solid var(--black)", borderRadius: 12, background: "var(--black)", color: "var(--white)", textTransform: "uppercase", letterSpacing: 1 }}>
                    Strategy
                  </span>
                </div>
                <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 700 }}>
                  -{formatMoney(augustaDeduction)}
                </span>
              </div>
              <SummaryRow label="Taxable Income" value={formatMoney(taxableIncome)} bold />
              <SummaryRow label="Estimated Tax" value={formatMoney(estimatedTax)} bold last />
            </div>

            <div style={{ borderTop: "3px solid var(--black)", padding: 16, background: "var(--gray-100)" }}>
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                Strategy Savings
              </p>
              <p style={{ fontSize: 13, color: "var(--gray-600)" }}>
                Augusta Rule saves you <strong>{formatMoney(augustaDeduction)}</strong> in deductions this year.
              </p>
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, bold, last }: { label: string; value: string; bold?: boolean; last?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: last ? "none" : "1px solid var(--gray-200)" }}>
      <span style={{ fontFamily: bold ? "'Cabinet Grotesk', sans-serif" : "inherit", fontSize: 13, fontWeight: bold ? 700 : 500, color: "var(--black)" }}>{label}</span>
      <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: bold ? 700 : 500, color: "var(--black)" }}>{value}</span>
    </div>
  );
}
