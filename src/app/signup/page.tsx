"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useProfileStore } from "@/lib/stores/useProfileStore";

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const setPersonalInfo = useProfileStore((s) => s.setPersonalInfo);

  const [screen, setScreen] = useState<"token" | "password">("token");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const formatToken = (raw: string) => {
    const clean = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 12);
    const parts = [];
    for (let i = 0; i < clean.length; i += 4) {
      parts.push(clean.slice(i, i + 4));
    }
    return parts.join("-");
  };

  const handleTokenSubmit = () => {
    const clean = token.replace(/-/g, "").toUpperCase();
    if (!clean.startsWith("DREW")) {
      setTokenError("Invalid access token.");
      return;
    }
    if (clean.length < 12) {
      setTokenError("Enter a complete 12-character token.");
      return;
    }
    if (!email || !email.includes("@")) {
      setTokenError("Enter a valid email address.");
      return;
    }
    setTokenError("");
    setScreen("password");
  };

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const allValid = hasMinLength && hasUppercase && hasNumber && passwordsMatch;

  const handleCreateAccount = () => {
    if (!allValid) return;
    login(email, token);
    setPersonalInfo({ email });
    router.push("/onboarding");
  };

  const requirements = [
    { met: hasMinLength, label: "8+ characters" },
    { met: hasUppercase, label: "1 uppercase letter" },
    { met: hasNumber, label: "1 number" },
    { met: passwordsMatch, label: "Passwords match" },
  ];

  if (screen === "token") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--background)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "60px 32px 40px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/heydrew-logo.svg"
              alt="HeyDrew!"
              width={200}
              height={100}
              style={{ margin: "0 auto 12px" }}
            />
            <p style={{ fontSize: 16, color: "var(--gray-600)", lineHeight: 1.5 }}>
              Enter your access token to get started
            </p>
          </div>

          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Access Token</label>
            <input
              className={`input-field ${tokenError ? "error" : ""}`}
              value={token}
              onChange={(e) => {
                setToken(formatToken(e.target.value));
                setTokenError("");
              }}
              placeholder="XXXX-XXXX-XXXX"
              style={{
                textAlign: "center",
                letterSpacing: 4,
                textTransform: "uppercase",
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: 20,
                fontWeight: 700,
              }}
            />
            <p
              style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                textAlign: "center",
                fontSize: 10,
                color: "var(--gray-400)",
                marginTop: 8,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Format: XXXX-XXXX-XXXX
            </p>
          </div>

          {tokenError && (
            <div
              className="animate-shake"
              style={{
                border: "3px solid var(--black)",
                borderRadius: 12,
                padding: 14,
                marginBottom: 20,
                textAlign: "center",
                background: "var(--gray-100)",
              }}
            >
              <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--black)" }}>
                {tokenError}
              </p>
            </div>
          )}

          <button className="btn-primary" onClick={handleTokenSubmit}>
            Redeem Access
          </button>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 11, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: 1 }}>
              No token? Contact Aspire4More
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Password screen
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
      <div style={{ width: "100%", maxWidth: 440, position: "relative" }}>
        {/* Back button — positioned to not shift the centered logo */}
        <button
          onClick={() => setScreen("token")}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
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

        <div style={{ marginBottom: 36, textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/heydrew-logo.svg"
            alt="HeyDrew!"
            width={200}
            height={100}
            style={{ margin: "0 auto 20px" }}
          />
          <div
            style={{
              width: 56,
              height: 56,
              border: "3px solid var(--black)",
              borderRadius: 12,
              background: "var(--black)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              margin: "0 auto 16px",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--black)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Token verified
          </p>
          <h1
            style={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "var(--black)",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Create Account
          </h1>
          <p style={{ fontSize: 15, color: "var(--gray-600)" }}>
            Set a secure password for your account
          </p>
        </div>

        <PasswordInput label="Password" value={password} onChange={setPassword} placeholder="Create a password" />
        <PasswordInput label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" />

        <div
          style={{
            border: "2px solid var(--black)",
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <p style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Requirements
          </p>
          {requirements.map((req) => (
            <div
              key={req.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                fontWeight: 600,
                color: req.met ? "var(--black)" : "var(--gray-400)",
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  border: "2px solid var(--black)",
                  borderRadius: 12,
                  background: req.met ? "var(--black)" : "var(--white)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {req.met && (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              {req.label}
            </div>
          ))}
        </div>

        <button className="btn-primary" disabled={!allValid} onClick={handleCreateAccount}>
          Create Account
        </button>
      </div>
    </div>
  );
}
