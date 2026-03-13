"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UploadStatus {
  status: "missing" | "uploaded" | "in-review" | "approved";
  fileName: string;
}

interface DashboardState {
  augustaCompleted: boolean;
  augustaSavings: number;
  augustaDailyRate: number;
  augustaDays: number;
  checklistPaidSelf: boolean;
  checklistAccountingUpdated: boolean;
  uploads: Record<string, UploadStatus>;
  caseNumber: string | null;
  setAugustaCompleted: (savings: number, dailyRate: number, days: number) => void;
  toggleChecklist: (key: "checklistPaidSelf" | "checklistAccountingUpdated") => void;
  setUploadStatus: (docId: string, status: UploadStatus) => void;
  removeUpload: (docId: string) => void;
  setCaseNumber: (caseNumber: string) => void;
  reset: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      augustaCompleted: false,
      augustaSavings: 0,
      augustaDailyRate: 0,
      augustaDays: 0,
      checklistPaidSelf: false,
      checklistAccountingUpdated: false,
      uploads: {},
      caseNumber: null,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setAugustaCompleted: (savings, dailyRate, days) =>
        set({
          augustaCompleted: true,
          augustaSavings: savings,
          augustaDailyRate: dailyRate,
          augustaDays: days,
        }),
      toggleChecklist: (key) =>
        set((state) => ({ [key]: !state[key] })),
      setUploadStatus: (docId, status) =>
        set((state) => ({
          uploads: { ...state.uploads, [docId]: status },
        })),
      removeUpload: (docId) =>
        set((state) => {
          const { [docId]: _, ...rest } = state.uploads;
          return { uploads: rest };
        }),
      setCaseNumber: (caseNumber) => set({ caseNumber }),
      reset: () =>
        set({
          augustaCompleted: false,
          augustaSavings: 0,
          augustaDailyRate: 0,
          augustaDays: 0,
          checklistPaidSelf: false,
          checklistAccountingUpdated: false,
          uploads: {},
          caseNumber: null,
        }),
    }),
    {
      name: "heydrew_dashboard",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const useTaxUploadUnlocked = () =>
  useDashboardStore(
    (s) => s.checklistPaidSelf && s.checklistAccountingUpdated
  );
