"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useProfileStore } from "@/lib/stores/useProfileStore";

export function useRouteGuard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const authHydrated = useAuthStore((s) => s._hasHydrated);
  const profileHydrated = useProfileStore((s) => s._hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isProfileComplete = useProfileStore((s) => s.isComplete);

  useEffect(() => {
    if (!authHydrated || !profileHydrated) return;

    if (!isAuthenticated) {
      router.replace("/signup");
      return;
    }

    if (!isProfileComplete) {
      router.replace("/onboarding");
      return;
    }

    setReady(true);
  }, [authHydrated, profileHydrated, isAuthenticated, isProfileComplete, router]);

  return { ready };
}
