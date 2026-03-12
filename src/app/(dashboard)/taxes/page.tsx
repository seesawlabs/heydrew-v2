"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboardStore, useTaxUploadUnlocked } from "@/lib/stores/useDashboardStore";
import { FileUploadCard } from "@/components/ui/file-upload-card";

const TAX_DOCUMENTS = [
  { id: "1040", label: "Form 1040" },
  { id: "schedule-c", label: "Schedule C" },
  { id: "w2", label: "W-2" },
  { id: "1099-nec", label: "1099-NEC" },
  { id: "1099-int", label: "1099-INT" },
  { id: "expense-report", label: "Expense Report" },
  { id: "1099-div", label: "1099-DIV" },
  { id: "1098", label: "1098" },
  { id: "schedule-e", label: "Schedule E" },
  { id: "1040-es", label: "1040-ES" },
];

const PROGRESS_STEPS = ["Uploaded", "In Review", "Approved", "Filing"];

function formatMoney(n: number) {
  return "$" + n.toLocaleString("en-US");
}

export default function TaxesPage() {
  const router = useRouter();
  const taxUploadUnlocked = useTaxUploadUnlocked();
  const { uploads, setUploadStatus, augustaSavings } = useDashboardStore();

  useEffect(() => {
    if (!taxUploadUnlocked) {
      router.replace("/dashboard");
    }
  }, [taxUploadUnlocked, router]);

  if (!taxUploadUnlocked) return null;

  const uploadedCount = Object.keys(uploads).length;
  const currentStep = uploadedCount === 0 ? 0 : uploadedCount >= TAX_DOCUMENTS.length ? 2 : 1;

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
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Source Documents
          </h3>
          <div style={{ border: "3px solid var(--black)", borderRadius: 12 }}>
            {TAX_DOCUMENTS.map((doc) => {
              const upload = uploads[doc.id];
              return (
                <FileUploadCard
                  key={doc.id}
                  label={doc.label}
                  status={upload?.status || "missing"}
                  fileName={upload?.fileName}
                  onUpload={(file) =>
                    setUploadStatus(doc.id, { status: "uploaded", fileName: file.name })
                  }
                />
              );
            })}
          </div>
        </div>

        {/* Tax Summary */}
        <div style={{ marginBottom: 40 }}>
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
        </div>
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
