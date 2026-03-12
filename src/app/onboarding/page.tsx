"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useProfileStore } from "@/lib/stores/useProfileStore";

const BUSINESS_TYPES = [
  "Sole proprietorship",
  "LLC",
  "S-Corporation",
  "C-Corporation",
  "Partnership",
  "Other",
];

const INDUSTRIES = [
  "Retail/E-commerce",
  "Food & Beverage",
  "Professional Services",
  "Healthcare",
  "Construction/Trades",
  "Technology",
  "Creative/Media",
  "Real Estate",
  "Other",
];

const TAX_YEARS = ["2024", "2025", "2026"];

function PillSelector({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            padding: "10px 24px",
            border: "3px solid var(--black)",
            borderRadius: 12,
            background: value === opt ? "var(--black)" : "var(--white)",
            color: value === opt ? "var(--white)" : "var(--black)",
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authHydrated = useAuthStore((s) => s._hasHydrated);
  const authEmail = useAuthStore((s) => s.email);

  const { business, personal, setBusinessInfo, setPersonalInfo, completeProfile } =
    useProfileStore();

  useEffect(() => {
    if (authHydrated && !isAuthenticated) {
      router.replace("/signup");
    }
  }, [authHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (authEmail && !personal.email) {
      setPersonalInfo({ email: authEmail });
    }
  }, [authEmail, personal.email, setPersonalInfo]);

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const businessValid = business.name && business.type && business.industry && business.taxYear;
  const personalValid = personal.fullName;

  const handleComplete = () => {
    completeProfile();
    router.push("/dashboard");
  };

  const steps = ["Business", "Personal", "Review"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 32px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 500 }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/heydrew-logo.svg"
            alt="HeyDrew!"
            width={160}
            height={80}
            style={{ margin: "0 auto" }}
          />
        </div>

        <div style={{ marginBottom: 36, marginTop: 24 }}>
          <ProgressSteps steps={steps} current={step} />
        </div>

        {step === 0 && (
          <div className="animate-fadeIn">
            <h2
              style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: 24,
                fontWeight: 700,
                color: "var(--black)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Your Business
            </h2>
            <p style={{ fontSize: 15, color: "var(--gray-600)", marginBottom: 28 }}>
              This helps us find the best tax strategies for you.
            </p>

            <div className="input-group">
              <label className="input-label">Business Name</label>
              <input
                className="input-field"
                value={business.name}
                onChange={(e) => setBusinessInfo({ name: e.target.value })}
                placeholder="Your business name"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Business Type</label>
              <select
                className="select-field"
                value={business.type}
                onChange={(e) => setBusinessInfo({ type: e.target.value })}
              >
                <option value="">Select type</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Industry</label>
              <select
                className="select-field"
                value={business.industry}
                onChange={(e) => setBusinessInfo({ industry: e.target.value })}
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Tax Year</label>
              <PillSelector
                options={TAX_YEARS}
                value={business.taxYear}
                onChange={(v) => setBusinessInfo({ taxYear: v })}
              />
            </div>

            <div style={{ marginTop: 32 }}>
              <button className="btn-primary" disabled={!businessValid} onClick={() => setStep(1)}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fadeIn">
            <h2
              style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: 24,
                fontWeight: 700,
                color: "var(--black)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Personal Info
            </h2>
            <p style={{ fontSize: 15, color: "var(--gray-600)", marginBottom: 28 }}>
              How should we reach you?
            </p>

            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                className="input-field"
                value={personal.fullName}
                onChange={(e) => setPersonalInfo({ fullName: e.target.value })}
                placeholder="Your full name"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Email</label>
              <input className="input-field" value={personal.email} readOnly />
            </div>

            <div className="input-group">
              <label className="input-label">Phone (Optional)</label>
              <input
                className="input-field"
                value={personal.phone}
                onChange={(e) => setPersonalInfo({ phone: formatPhone(e.target.value) })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="input-group">
              <ToggleSwitch
                checked={personal.textUpdates}
                onChange={(v) => setPersonalInfo({ textUpdates: v })}
                label="Receive text updates about my case"
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <button
                className="btn-secondary"
                onClick={() => setStep(0)}
                style={{ width: "auto", padding: "14px 24px" }}
              >
                Back
              </button>
              <button
                className="btn-primary"
                disabled={!personalValid}
                onClick={() => setStep(2)}
                style={{ flex: 1 }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeIn">
            <h2
              style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: 24,
                fontWeight: 700,
                color: "var(--black)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Review
            </h2>
            <p style={{ fontSize: 15, color: "var(--gray-600)", marginBottom: 28 }}>
              Confirm your details are correct.
            </p>

            {/* Business Card */}
            <div style={{ border: "3px solid var(--black)", borderRadius: 12, marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: "3px solid var(--black)",
                  background: "var(--gray-100)",
                }}
              >
                <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                  Business
                </span>
                <button
                  onClick={() => setStep(0)}
                  style={{
                    padding: "2px 10px",
                    border: "2px solid var(--black)",
                    borderRadius: 12,
                    background: "var(--white)",
                    fontFamily: "'Cabinet Grotesk', sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  Edit
                </button>
              </div>
              <div style={{ padding: 16 }}>
                <ReviewRow label="Name" value={business.name} />
                <ReviewRow label="Type" value={business.type} />
                <ReviewRow label="Industry" value={business.industry} />
                <ReviewRow label="Tax year" value={business.taxYear} />
              </div>
            </div>

            {/* Personal Card */}
            <div style={{ border: "3px solid var(--black)", borderRadius: 12, marginBottom: 32 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: "3px solid var(--black)",
                  background: "var(--gray-100)",
                }}
              >
                <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                  Personal
                </span>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    padding: "2px 10px",
                    border: "2px solid var(--black)",
                    borderRadius: 12,
                    background: "var(--white)",
                    fontFamily: "'Cabinet Grotesk', sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  Edit
                </button>
              </div>
              <div style={{ padding: 16 }}>
                <ReviewRow label="Name" value={personal.fullName} />
                <ReviewRow label="Email" value={personal.email} />
                <ReviewRow label="Phone" value={personal.phone || "—"} />
                <ReviewRow label="Texts" value={personal.textUpdates ? "Yes" : "No"} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn-secondary"
                onClick={() => setStep(1)}
                style={{ width: "auto", padding: "14px 24px" }}
              >
                Back
              </button>
              <button className="btn-primary" onClick={handleComplete} style={{ flex: 1 }}>
                Complete Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--gray-200)" }}>
      <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 11, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--black)" }}>{value}</span>
    </div>
  );
}
