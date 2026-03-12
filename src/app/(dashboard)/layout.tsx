"use client";

import { useRouteGuard } from "@/lib/hooks/useRouteGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready } = useRouteGuard();

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background)",
        }}
      >
        <div
          style={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 2,
            color: "var(--gray-400)",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
