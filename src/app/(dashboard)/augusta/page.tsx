"use client";

import { useEffect, useRef } from "react";
import { ChatContainer } from "./components/ChatContainer";
import { useAugustaFlow } from "./hooks/useAugustaFlow";
import { useProfileStore } from "@/lib/stores/useProfileStore";
import { useDashboardStore } from "@/lib/stores/useDashboardStore";

const ENTITY_TYPE_MAP: Record<string, string> = {
  "Sole proprietorship": "sole_prop",
  "LLC": "llc",
  "S-Corporation": "s_corp",
  "C-Corporation": "c_corp",
  "Partnership": "partnership",
  "Other": "llc",
};

export default function AugustaPage() {
  const updateEngagement = useAugustaFlow((s) => s.updateEngagement);
  const qualificationStatus = useAugustaFlow((s) => s.engagement.qualificationStatus);
  const fairMarketDailyRate = useAugustaFlow((s) => s.engagement.fairMarketDailyRate);
  const estimatedAnnualIncome = useAugustaFlow((s) => s.engagement.estimatedAnnualIncome);
  const plannedDays = useAugustaFlow((s) => s.engagement.plannedDays);
  const plannedEvents = useAugustaFlow((s) => s.engagement.plannedEvents);

  const setAugustaCompleted = useDashboardStore((s) => s.setAugustaCompleted);
  const business = useProfileStore((s) => s.business);
  const personal = useProfileStore((s) => s.personal);
  const seeded = useRef(false);
  const synced = useRef(false);

  // Seed engagement data from profile store
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    updateEngagement({
      entityName: business.name || "Your Business LLC",
      entityType: ENTITY_TYPE_MAP[business.type] || "s_corp",
      ownerName: personal.fullName || "",
    });
  }, [updateEngagement, business.name, business.type, personal.fullName]);

  // Sync qualification to dashboard store
  useEffect(() => {
    if (synced.current) return;
    if (qualificationStatus === "qualified" && fairMarketDailyRate && estimatedAnnualIncome) {
      synced.current = true;
      const days = plannedEvents.reduce((sum, e) => sum + (e.days || 1), 0) || plannedDays || 14;
      setAugustaCompleted(estimatedAnnualIncome, fairMarketDailyRate, days);
    }
  }, [qualificationStatus, fairMarketDailyRate, estimatedAnnualIncome, plannedDays, plannedEvents, setAugustaCompleted]);

  return <ChatContainer />;
}
