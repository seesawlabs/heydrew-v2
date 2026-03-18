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

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming", "District of Columbia",
];

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
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "16px 20px",
        border: "3px solid var(--black)",
        borderRadius: 12,
        background: selected ? "var(--black)" : "var(--white)",
        color: selected ? "var(--white)" : "var(--black)",
        fontFamily: "'Cabinet Grotesk', sans-serif",
        fontSize: 15,
        fontWeight: 700,
        cursor: "pointer",
        textAlign: "center",
        marginBottom: 10,
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

// Personal sub-step definitions
const PERSONAL_SUB_STEPS = [
  "revenue",
  "employees",
  "marital",
  "kids",
  "residence",
  "insurance",
  "age",
  "state",
  "contact",
] as const;
type PersonalSubStep = (typeof PERSONAL_SUB_STEPS)[number];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0=business, 1=personal, 2=review
  const [personalSubStep, setPersonalSubStep] = useState<PersonalSubStep>("revenue");
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

  const formatRevenue = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "");
    if (!digits) return "";
    return "$" + Number(digits).toLocaleString("en-US");
  };

  const businessValid = business.name && business.type && business.industry && business.taxYear;
  const personalValid =
    personal.expectedRevenue &&
    personal.w2Employees &&
    personal.maritalStatus &&
    personal.kidsUnder18 &&
    personal.ownsResidence &&
    personal.hasHealthInsurance &&
    personal.age &&
    personal.stateOfResidence &&
    personal.fullName;

  const handleComplete = () => {
    completeProfile();
    router.push("/dashboard");
  };

  const steps = ["Business", "Personal", "Review"];

  const currentSubIndex = PERSONAL_SUB_STEPS.indexOf(personalSubStep);

  const goNextPersonalSub = () => {
    if (currentSubIndex < PERSONAL_SUB_STEPS.length - 1) {
      setPersonalSubStep(PERSONAL_SUB_STEPS[currentSubIndex + 1]);
    } else {
      setStep(2); // go to review
    }
  };

  const goPrevPersonalSub = () => {
    if (currentSubIndex > 0) {
      setPersonalSubStep(PERSONAL_SUB_STEPS[currentSubIndex - 1]);
    } else {
      setStep(0); // back to business
    }
  };

  // Auto-advance on single-select options (after a brief delay for visual feedback)
  const selectAndAdvance = (field: string, value: string) => {
    setPersonalInfo({ [field]: value });
    setTimeout(() => goNextPersonalSub(), 200);
  };

  // Sub-step progress (shown below main progress)
  const subStepProgress = `${currentSubIndex + 1} of ${PERSONAL_SUB_STEPS.length}`;

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

        {/* ═══ STEP 0: BUSINESS ═══ */}
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
              <button className="btn-primary" disabled={!businessValid} onClick={() => { setStep(1); setPersonalSubStep("revenue"); }}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 1: PERSONAL (sub-steps) ═══ */}
        {step === 1 && (
          <div className="animate-fadeIn" key={personalSubStep}>
            {/* Back button */}
            <button
              onClick={goPrevPersonalSub}
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
                marginBottom: 20,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--black)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <p style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontSize: 10,
              fontWeight: 700,
              color: "var(--gray-400)",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginBottom: 16,
            }}>
              {subStepProgress}
            </p>

            {/* ── Revenue ── */}
            {personalSubStep === "revenue" && (
              <>
                <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                  What is your expected annual top-line revenue?
                </h2>
                <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 28 }}>
                  This helps us estimate potential tax savings.
                </p>
                <div className="input-group">
                  <input
                    className="input-field"
                    value={personal.expectedRevenue}
                    onChange={(e) => setPersonalInfo({ expectedRevenue: formatRevenue(e.target.value) })}
                    placeholder="$0"
                    inputMode="numeric"
                    style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Cabinet Grotesk', sans-serif" }}
                  />
                </div>
                <button
                  className="btn-primary"
                  disabled={!personal.expectedRevenue}
                  onClick={goNextPersonalSub}
                  style={{ marginTop: 16 }}
                >
                  Continue
                </button>
              </>
            )}

            {/* ── W2 Employees ── */}
            {personalSubStep === "employees" && (
              <>
                <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                  Do you have W2 employees other than yourself or contractors?
                </h2>
                <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 28 }}>
                  Select the option that best describes your team.
                </p>
                <OptionButton label="Just me" selected={personal.w2Employees === "Just me"} onClick={() => selectAndAdvance("w2Employees", "Just me")} />
                <OptionButton label="1–5 employees" selected={personal.w2Employees === "1-5 employees"} onClick={() => selectAndAdvance("w2Employees", "1-5 employees")} />
                <OptionButton label="6+ employees" selected={personal.w2Employees === "6+ employees"} onClick={() => selectAndAdvance("w2Employees", "6+ employees")} />
              </>
            )}

            {/* ── Marital Status ── */}
            {personalSubStep === "marital" && (
              <>
                <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                  What is your marital status?
                </h2>
                <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 28 }}>
                  This affects your tax filing status.
                </p>
                <OptionButton label="Single" selected={personal.maritalStatus === "Single"} onClick={() => selectAndAdvance("maritalStatus", "Single")} />
                <OptionButton label="Married" selected={personal.maritalStatus === "Married"} onClick={() => selectAndAdvance("maritalStatus", "Married")} />
                <OptionButton label="Head of household" selected={personal.maritalStatus === "Head of household"} onClick={() => selectAndAdvance("maritalStatus", "Head of household")} />
              </>
            )}

            {/* ── Kids ── */}
            {personalSubStep === "kids" && (
              <>
                <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                  How many kids do you have under the age of 18?
                </h2>
                <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 28 }}>
                  Dependents can impact your tax strategy.
                </p>
                {["None", "1", "2", "3", "4", "5+"].map((opt) => (
                  <OptionButton key={opt} label={opt} selected={personal.kidsUnder18 === opt} onClick={() => selectAndAdvance("kidsUnder18", opt)} />
                ))}
              </>
            )}

            {/* ── Own Residence ── */}
            {personalSubStep === "residence" && (
              <>
                <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                  Do you own your primary residence?
                </h2>
                <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 28 }}>
                  Home ownership opens up specific tax strategies.
                </p>
                <OptionButton label="Yes" selected={personal.ownsResidence === "Yes"} onClick={() => selectAndAdvance("ownsResidence", "Yes")} />
                <OptionButton label="No" selected={personal.ownsResidence === "No"} onClick={() => selectAndAdvance("ownsResidence", "No")} />
              </>
            )}

            {/* ── Health Insurance ── */}
            {personalSubStep === "insurance" && (
              <>
                <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                  Do you have health insurance?
                </h2>
                <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 28 }}>
                  Insurance status can affect deduction eligibility.
                </p>
                <OptionButton label="Yes" selected={personal.hasHealthInsurance === "Yes"} onClick={() => selectAndAdvance("hasHealthInsurance", "Yes")} />
                <OptionButton label="No" selected={personal.hasHealthInsurance === "No"} onClick={() => selectAndAdvance("hasHealthInsurance", "No")} />
              </>
            )}

            {/* ── Age ── */}
            {personalSubStep === "age" && (
              <>
                <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                  What is your age?
                </h2>
                <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 28 }}>
                  Certain strategies have age-based thresholds.
                </p>
                <div className="input-group">
                  <input
                    className="input-field"
                    type="number"
                    min="18"
                    max="120"
                    value={personal.age}
                    onChange={(e) => setPersonalInfo({ age: e.target.value })}
                    placeholder="Enter your age"
                    inputMode="numeric"
                    style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Cabinet Grotesk', sans-serif" }}
                  />
                </div>
                <button
                  className="btn-primary"
                  disabled={!personal.age}
                  onClick={goNextPersonalSub}
                  style={{ marginTop: 16 }}
                >
                  Continue
                </button>
              </>
            )}

            {/* ── State of Residence ── */}
            {personalSubStep === "state" && (
              <>
                <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                  What is your state of residence?
                </h2>
                <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 28 }}>
                  State taxes vary — this helps us calculate savings.
                </p>
                <div className="input-group">
                  <select
                    className="select-field"
                    value={personal.stateOfResidence}
                    onChange={(e) => setPersonalInfo({ stateOfResidence: e.target.value })}
                  >
                    <option value="">Select a state</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn-primary"
                  disabled={!personal.stateOfResidence}
                  onClick={goNextPersonalSub}
                  style={{ marginTop: 16 }}
                >
                  Continue
                </button>
              </>
            )}

            {/* ── Contact Info ── */}
            {personalSubStep === "contact" && (
              <>
                <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                  Your Contact Information
                </h2>
                <p style={{ fontSize: 14, color: "var(--gray-600)", marginBottom: 28 }}>
                  So we can keep you updated on your case.
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

                <button
                  className="btn-primary"
                  disabled={!personal.fullName}
                  onClick={() => setStep(2)}
                  style={{ marginTop: 16 }}
                >
                  Continue
                </button>
              </>
            )}
          </div>
        )}

        {/* ═══ STEP 2: REVIEW ═══ */}
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
                  onClick={() => { setStep(1); setPersonalSubStep("revenue"); }}
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
                <ReviewRow label="Revenue" value={personal.expectedRevenue} />
                <ReviewRow label="Employees" value={personal.w2Employees} />
                <ReviewRow label="Marital status" value={personal.maritalStatus} />
                <ReviewRow label="Kids under 18" value={personal.kidsUnder18} />
                <ReviewRow label="Owns residence" value={personal.ownsResidence} />
                <ReviewRow label="Health insurance" value={personal.hasHealthInsurance} />
                <ReviewRow label="Age" value={personal.age} />
                <ReviewRow label="State" value={personal.stateOfResidence} />
                <ReviewRow label="Name" value={personal.fullName} />
                <ReviewRow label="Email" value={personal.email} />
                <ReviewRow label="Phone" value={personal.phone || "—"} />
                <ReviewRow label="Text updates" value={personal.textUpdates ? "Yes" : "No"} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn-secondary"
                onClick={() => { setStep(1); setPersonalSubStep("contact"); }}
                style={{ width: "auto", padding: "14px 24px" }}
              >
                Back
              </button>
              <button className="btn-primary" disabled={!personalValid} onClick={handleComplete} style={{ flex: 1 }}>
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
