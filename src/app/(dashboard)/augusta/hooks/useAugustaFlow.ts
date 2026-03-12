import { create } from "zustand";
import type { GeneratedDocument } from "../lib/documents/generateAll";

export type Stage = "hook" | "qualification" | "documents" | "tracker";

export type MessageRole = "bot" | "user";

export type MessageType =
  | "text"
  | "chips"
  | "address-input"
  | "property-form"
  | "savings-card"
  | "disqualification"
  | "warning"
  | "doc-package"
  | "property-preview";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  chips?: string[];
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface PropertyDetails {
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  amenities: string[];
}

export interface CompSource {
  source: string;
  listingTitle: string;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  url?: string;
  location?: string;
  imageUrl?: string;
  rating?: number;
  reviews?: number;
  propertyType?: string;
  distanceMeters?: number;
}

export interface PlannedEvent {
  id: string;
  type: string;
  date: string;
  days: number;
  attendees: number;
  description: string;
}

export interface EngagementData {
  // Stage 1
  ownsHome: boolean | null;
  propertyAddress: string;
  propertyDetails: PropertyDetails | null;
  willingToRent: boolean | null;
  fairMarketDailyRate: number | null;
  compSources: CompSource[];
  estimatedAnnualIncome: number | null;
  estimatedTaxSavings: number | null;
  entityType: string;
  entityName: string;
  ownerName: string;
  addressDetails: {
    formattedAddress: string;
    city: string;
    state: string;
    zip: string;
    lat: number;
    lng: number;
  } | null;
  // Stage 2
  rentsOver14Days: boolean | null;
  homeOfficeDeduction: boolean | null;
  homeOfficeConflictAcknowledged: boolean;
  businessPurposes: string[];
  plannedDays: number | null;
  plannedEvents: PlannedEvent[];
  qualificationStatus: "pending" | "qualified" | "disqualified" | "paused";
  disqualificationReason: string | null;
}

export type FlowStep =
  // Stage 1
  | "welcome"
  | "owns_home"
  | "address"
  | "willing_to_rent"
  | "explain_concept"
  | "interested_after_explain"
  | "property_details"
  | "calculating"
  | "savings_display"
  | "proceed_to_qualify"
  // Stage 2
  | "q2_rents_over_14"
  | "q2_home_office"
  | "q2_home_office_conflict"
  | "q2_business_purpose"
  | "q2_planned_days"
  | "q2_event_planner"
  | "q2_qualified"
  // Stage 3
  | "s3_generating"
  | "s3_documents_ready"
  // Shared
  | "disqualified"
  | "exit";

interface AugustaFlowState {
  stage: Stage;
  step: FlowStep;
  messages: ChatMessage[];
  engagement: EngagementData;
  isTyping: boolean;
  generatedDocs: GeneratedDocument[] | null;

  setStage: (stage: Stage) => void;
  setStep: (step: FlowStep) => void;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  updateEngagement: (data: Partial<EngagementData>) => void;
  setIsTyping: (typing: boolean) => void;
  setGeneratedDocs: (docs: GeneratedDocument[] | null) => void;
  reset: () => void;
}

const initialEngagement: EngagementData = {
  ownsHome: null,
  propertyAddress: "",
  propertyDetails: null,
  willingToRent: null,
  fairMarketDailyRate: null,
  compSources: [],
  estimatedAnnualIncome: null,
  estimatedTaxSavings: null,
  entityType: "s_corp",
  entityName: "Your Business LLC",
  ownerName: "",
  addressDetails: null,
  rentsOver14Days: null,
  homeOfficeDeduction: null,
  homeOfficeConflictAcknowledged: false,
  businessPurposes: [],
  plannedDays: null,
  plannedEvents: [],
  qualificationStatus: "pending",
  disqualificationReason: null,
};

let messageCounter = 0;

export const useAugustaFlow = create<AugustaFlowState>((set) => ({
  stage: "hook",
  step: "welcome",
  messages: [],
  engagement: { ...initialEngagement },
  isTyping: false,
  generatedDocs: null,

  setStage: (stage) => set({ stage }),
  setStep: (step) => set({ step }),

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: `msg-${++messageCounter}-${Date.now()}`,
          timestamp: Date.now(),
        },
      ],
    })),

  updateEngagement: (data) =>
    set((state) => ({
      engagement: { ...state.engagement, ...data },
    })),

  setIsTyping: (isTyping) => set({ isTyping }),

  setGeneratedDocs: (generatedDocs) => set({ generatedDocs }),

  reset: () =>
    set({
      stage: "hook",
      step: "welcome",
      messages: [],
      engagement: { ...initialEngagement },
      isTyping: false,
      generatedDocs: null,
    }),
}));
