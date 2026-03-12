"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BusinessInfo {
  name: string;
  type: string;
  industry: string;
  taxYear: string;
}

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  textUpdates: boolean;
}

interface ProfileState {
  isComplete: boolean;
  business: BusinessInfo;
  personal: PersonalInfo;
  setBusinessInfo: (info: Partial<BusinessInfo>) => void;
  setPersonalInfo: (info: Partial<PersonalInfo>) => void;
  completeProfile: () => void;
  reset: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

const defaultBusiness: BusinessInfo = {
  name: "",
  type: "",
  industry: "",
  taxYear: "2025",
};

const defaultPersonal: PersonalInfo = {
  fullName: "",
  email: "",
  phone: "",
  textUpdates: false,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      isComplete: false,
      business: { ...defaultBusiness },
      personal: { ...defaultPersonal },
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setBusinessInfo: (info) =>
        set((state) => ({
          business: { ...state.business, ...info },
        })),
      setPersonalInfo: (info) =>
        set((state) => ({
          personal: { ...state.personal, ...info },
        })),
      completeProfile: () => set({ isComplete: true }),
      reset: () =>
        set({
          isComplete: false,
          business: { ...defaultBusiness },
          personal: { ...defaultPersonal },
        }),
    }),
    {
      name: "heydrew_profile",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
