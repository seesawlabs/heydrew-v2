"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { BotMessage } from "./BotMessage";
import { UserMessage } from "./UserMessage";
import { SuggestionChips } from "./SuggestionChips";
import { TypingIndicator } from "./TypingIndicator";
import { AddressInput } from "./AddressInput";
import { PropertyDetailsForm } from "./PropertyDetailsForm";
import { SavingsCard } from "./SavingsCard";
import { DisqualificationCard } from "./DisqualificationCard";
import { WarningBanner } from "./WarningBanner";
import { BusinessPurposeSelector } from "./BusinessPurposeSelector";
import { PlannedDaysInput } from "./PlannedDaysInput";
import { EventPlannerForm } from "./EventPlannerForm";
import { QualificationSummary } from "./QualificationSummary";
import { DocGenerationProgress } from "./DocGenerationProgress";
import { DocumentPackageCard } from "./DocumentPackageCard";
import { useRouter } from "next/navigation";
import {
  useAugustaFlow,
  type FlowStep,
  type PropertyDetails,
  type PlannedEvent,
} from "../hooks/useAugustaFlow";
import { generateDocumentPackage } from "../lib/documents/generateAll";
import {
  calculateAugustaRate,
  estimateMarginalRate,
} from "@/lib/tax/estimateSavings";

function extractState(address: string): string {
  const stateMatch = address.match(
    /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/i
  );
  return stateMatch ? stateMatch[1].toUpperCase() : "TX";
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ChatContainer() {
  const router = useRouter();
  const {
    stage,
    step,
    messages,
    engagement,
    isTyping,
    generatedDocs,
    setStage,
    setStep,
    addMessage,
    updateEngagement,
    setIsTyping,
    setGeneratedDocs,
  } = useAugustaFlow();

  const scrollRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const [propertyLookup, setPropertyLookup] = useState<{
    loading: boolean;
    data: { bedrooms: number; bathrooms: number; squareFeet: number; amenities: string[] } | null;
    meta: { propertyType?: string | null; yearBuilt?: number | null; lotSqft?: number | null } | null;
  }>({ loading: false, data: null, meta: null });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, step]);

  const botSay = useCallback(
    (content: string, thenStep?: FlowStep) => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage({ role: "bot", type: "text", content });
        if (thenStep) setStep(thenStep);
      }, 800 + Math.random() * 600);
    },
    [addMessage, setIsTyping, setStep]
  );

  // Start the flow (guard against React strict mode double-mount)
  useEffect(() => {
    if (hasInitialized.current || messages.length > 0) return;
    hasInitialized.current = true;
    botSay(
      "Let's see if you could pay yourself tax-free rental income through your business. Quick question — do you own a personal residence?",
      "owns_home"
    );
  }, [botSay, messages.length]);

  // ── Stage 2 entry helper ──
  const startStage2 = useCallback(() => {
    setStage("qualification");
    botSay(
      "Let's make sure you fully qualify. A few quick questions:",
      "q2_rents_over_14"
    );
    setTimeout(() => {
      // follow-up question after the intro
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage({
          role: "bot",
          type: "text",
          content:
            "Do you currently rent your home out to anyone else — Airbnb guests, tenants, or other businesses — for more than 14 days per year?",
        });
      }, 1200);
    }, 1600);
  }, [setStage, botSay, setIsTyping, addMessage]);

  // ── Chip handler (both stages) ──
  const handleChipSelect = (chip: string) => {
    addMessage({ role: "user", type: "text", content: chip });

    switch (step) {
      // ═══ STAGE 1 ═══
      case "owns_home":
        if (chip === "Yes") {
          updateEngagement({ ownsHome: true });
          botSay("Great. What's the address?", "address");
        } else {
          updateEngagement({ ownsHome: false });
          setStep("disqualified");
          setTimeout(() => {
            addMessage({
              role: "bot",
              type: "disqualification",
              content:
                "The Augusta Rule requires a personal residence. This strategy won't work right now, but there may be other strategies that fit your situation.",
            });
          }, 800);
        }
        break;

      case "willing_to_rent":
        if (chip === "Yes") {
          updateEngagement({ willingToRent: true });
          // Add property preview message that persists in chat
          addMessage({
            role: "bot",
            type: "property-preview",
            content: "",
            data: { address: engagement.propertyAddress },
          });
          botSay(
            "I'm pulling your property details now. Confirm or adjust, then we'll find comparable rates:",
            "property_details"
          );
        } else if (chip === "Not sure what this means") {
          botSay(
            `Here's how it works: ${engagement.entityName} pays YOU rent for days it uses your home for legitimate business purposes — like board meetings, strategy sessions, or team retreats. Under the Augusta Rule, that rental income is completely tax-free to you. And your business gets to deduct it.\n\nInterested?`,
            "interested_after_explain"
          );
        } else {
          setStep("exit");
          botSay(
            "No problem! We can explore other strategies that might work for you."
          );
        }
        break;

      case "interested_after_explain":
        if (chip === "Yes, show me the numbers") {
          updateEngagement({ willingToRent: true });
          addMessage({
            role: "bot",
            type: "property-preview",
            content: "",
            data: { address: engagement.propertyAddress },
          });
          botSay(
            "I'm pulling your property details now. Confirm or adjust, then we'll find comparable rates:",
            "property_details"
          );
        } else {
          setStep("exit");
          botSay(
            "No problem! We can explore other strategies that might work for you."
          );
        }
        break;

      // ═══ STAGE 2 ═══
      case "q2_rents_over_14":
        if (chip === "Yes") {
          updateEngagement({
            rentsOver14Days: true,
            qualificationStatus: "disqualified",
            disqualificationReason: "exceeds_14_day_limit",
          });
          setStep("disqualified");
          setTimeout(() => {
            addMessage({
              role: "bot",
              type: "disqualification",
              content:
                "The Augusta Rule only applies if your home is rented for 14 or fewer total days per year — across ALL renters. Since you're already over that threshold, this strategy won't work for this property.",
            });
          }, 800);
        } else {
          updateEngagement({ rentsOver14Days: false });
          botSay(
            "Do you currently claim a home office deduction on this property?",
            "q2_home_office"
          );
        }
        break;

      case "q2_home_office":
        if (chip === "Yes") {
          updateEngagement({ homeOfficeDeduction: true });
          setStep("q2_home_office_conflict");
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            addMessage({
              role: "bot",
              type: "warning",
              content:
                "Heads up — claiming both a home office deduction and Augusta Rule rental on the same property can create a conflict that draws IRS scrutiny. It's not an automatic disqualifier, but your tax advisor should review this.",
            });
          }, 800);
        } else {
          updateEngagement({ homeOfficeDeduction: false });
          botSay(
            "Perfect, no conflict there. Now let's talk about how you'd use your home for business:",
            "q2_business_purpose"
          );
        }
        break;

      case "q2_home_office_conflict":
        if (chip === "Continue, I understand") {
          updateEngagement({ homeOfficeConflictAcknowledged: true });
          botSay(
            "Noted — we'll flag this for your advisor. Now let's talk about how you'd use your home for business:",
            "q2_business_purpose"
          );
        } else {
          updateEngagement({
            qualificationStatus: "paused",
            disqualificationReason: "home_office_conflict_needs_review",
          });
          setStep("exit");
          botSay(
            "Smart move. We'll save your progress — come back after you've spoken with your advisor."
          );
        }
        break;

      default:
        break;
    }
  };

  // ── Stage 1 handlers ──
  const handleAddressSubmit = (
    address: string,
    details?: { formattedAddress: string; city: string; state: string; zip: string; lat: number; lng: number }
  ) => {
    const display = details?.formattedAddress || address;
    addMessage({ role: "user", type: "text", content: display });
    updateEngagement({
      propertyAddress: display,
      ...(details && { addressDetails: details }),
    });

    // Kick off property lookup in background
    setPropertyLookup({ loading: true, data: null, meta: null });
    fetch(`/api/property?address=${encodeURIComponent(display)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.bedrooms) {
          setPropertyLookup({
            loading: false,
            data: {
              bedrooms: data.bedrooms,
              bathrooms: data.bathrooms,
              squareFeet: data.squareFeet,
              amenities: data.amenities || [],
            },
            meta: {
              propertyType: data.propertyType,
              yearBuilt: data.yearBuilt,
              lotSqft: data.lotSqft,
            },
          });
        } else {
          setPropertyLookup({ loading: false, data: null, meta: null });
        }
      })
      .catch(() => setPropertyLookup({ loading: false, data: null, meta: null }));

    botSay(
      `Would you be open to renting your home to ${engagement.entityName} for meetings or events — up to 14 days this year?`,
      "willing_to_rent"
    );
  };

  const handlePropertySubmit = async (details: PropertyDetails) => {
    updateEngagement({ propertyDetails: details });
    addMessage({
      role: "user",
      type: "text",
      content: `${details.bedrooms} bed / ${details.bathrooms} bath, ${details.squareFeet.toLocaleString()} sq ft${details.amenities.length ? ` — ${details.amenities.join(", ")}` : ""}`,
    });

    setStep("calculating");
    setIsTyping(true);

    const state = extractState(engagement.propertyAddress);
    const marginalRate = estimateMarginalRate(engagement.entityType, state);

    // Fetch real Airbnb comps
    let rates: number[] = [];
    let sources: {
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
    }[] = [];

    const addr = engagement.addressDetails;
    {
      try {
        const params = new URLSearchParams({
          address: addr?.formattedAddress || engagement.propertyAddress,
          bedrooms: String(details.bedrooms),
          bathrooms: String(details.bathrooms),
          city: addr?.city || "",
          state: addr?.state || "",
        });
        const res = await fetch(`/api/comps?${params}`);
        const data = await res.json();

        if (res.ok && data.comps && data.comps.length > 0) {
          rates = data.rates;
          sources = data.comps;
        }
      } catch {
        // API failed — rates stays empty
      }
    }

    if (rates.length === 0) {
      // No comps available — show error and let user retry or continue
      setIsTyping(false);
      addMessage({
        role: "bot",
        type: "text",
        content:
          "I wasn't able to find comparable rental listings in your area right now. This can happen for some locations. You can still continue — we'll work with you to establish a fair market rate.",
      });
      // Use a reasonable estimate based on property details
      const estimatedRate =
        Math.round(
          (150 + details.bedrooms * 50 + details.bathrooms * 25 +
            Math.floor(details.squareFeet / 500) * 15 +
            details.amenities.length * 20) / 25
        ) * 25;
      const totalIncome = estimatedRate * 14;
      const savings = Math.round(totalIncome * marginalRate);
      updateEngagement({
        compSources: [],
        fairMarketDailyRate: estimatedRate,
        estimatedAnnualIncome: totalIncome,
        estimatedTaxSavings: savings,
      });
      addMessage({
        role: "bot",
        type: "savings-card",
        content: "",
        data: {
          dailyRate: estimatedRate,
          totalRentalIncome: totalIncome,
          estimatedTaxSavings: savings,
          days: 14,
          compSources: [],
        },
      });
      setStep("savings_display");
      return;
    }

    const result = calculateAugustaRate(rates, 14, marginalRate);

    updateEngagement({
      compSources: sources,
      fairMarketDailyRate: result.dailyRate,
      estimatedAnnualIncome: result.totalRentalIncome,
      estimatedTaxSavings: result.estimatedTaxSavings,
    });

    setIsTyping(false);
    addMessage({
      role: "bot",
      type: "text",
      content: `I found ${sources.length} comparable Airbnb rentals in your area. Here's what the Augusta Rule could look like for you:`,
    });
    // Persist savings card as a message so it stays in chat history
    addMessage({
      role: "bot",
      type: "savings-card",
      content: "",
      data: {
        dailyRate: result.dailyRate,
        totalRentalIncome: result.totalRentalIncome,
        estimatedTaxSavings: result.estimatedTaxSavings,
        days: 14,
        compSources: sources,
      },
    });
    setStep("savings_display");
  };

  // ── Stage 2 handlers ──
  const handleBusinessPurposes = (purposes: string[]) => {
    if (purposes.length === 0) {
      addMessage({ role: "user", type: "text", content: "None of these apply" });
      updateEngagement({
        qualificationStatus: "disqualified",
        disqualificationReason: "no_business_purpose",
      });
      setStep("disqualified");
      setTimeout(() => {
        addMessage({
          role: "bot",
          type: "disqualification",
          content:
            "The Augusta Rule requires a legitimate business purpose for each rental day. Without a valid business reason, the IRS could challenge the deduction. If you think of a use case later, come back anytime.",
        });
      }, 800);
      return;
    }

    addMessage({
      role: "user",
      type: "text",
      content: purposes.join(", "),
    });
    updateEngagement({ businessPurposes: purposes });
    botSay(
      "How many days are you planning to use your home for business purposes this tax year?",
      "q2_planned_days"
    );
  };

  const handlePlannedDays = (days: number) => {
    addMessage({ role: "user", type: "text", content: `${days} days` });
    updateEngagement({ plannedDays: days });

    // Recalculate savings with actual planned days
    if (engagement.fairMarketDailyRate) {
      const state = extractState(engagement.propertyAddress);
      const marginalRate = estimateMarginalRate(engagement.entityType, state);
      const totalIncome = engagement.fairMarketDailyRate * days;
      const savings = Math.round(totalIncome * marginalRate);
      updateEngagement({
        estimatedAnnualIncome: totalIncome,
        estimatedTaxSavings: savings,
      });
    }

    botSay(
      "Great. Let's plan out your events. For each one, I need the event type, date, and estimated attendees.",
      "q2_event_planner"
    );
  };

  const handleEventsSubmit = (events: PlannedEvent[]) => {
    const summary = events
      .map(
        (e) =>
          `${e.type} — ${e.days} day${e.days > 1 ? "s" : ""} starting ${e.date} (${e.attendees} attendees)`
      )
      .join("\n");
    addMessage({ role: "user", type: "text", content: summary });
    updateEngagement({
      plannedEvents: events,
      qualificationStatus: "qualified",
    });

    // Sum total days across all events
    const days = events.reduce((sum, e) => sum + (e.days || 1), 0);
    if (engagement.fairMarketDailyRate) {
      const state = extractState(engagement.propertyAddress);
      const marginalRate = estimateMarginalRate(engagement.entityType, state);
      const totalIncome = engagement.fairMarketDailyRate * days;
      const savings = Math.round(totalIncome * marginalRate);
      updateEngagement({
        plannedDays: days,
        estimatedAnnualIncome: totalIncome,
        estimatedTaxSavings: savings,
      });
    }

    botSay("You're fully qualified. Here's your plan:", "q2_qualified");
  };

  // ── Render active input ──
  const renderActiveInput = () => {
    switch (step) {
      // Stage 1
      case "owns_home":
        return (
          <SuggestionChips
            chips={["Yes", "No"]}
            onSelect={handleChipSelect}
          />
        );
      case "address":
        return <AddressInput onSubmit={handleAddressSubmit} />;
      case "willing_to_rent":
        return (
          <SuggestionChips
            chips={["Yes", "Not sure what this means", "No thanks"]}
            onSelect={handleChipSelect}
          />
        );
      case "interested_after_explain":
        return (
          <SuggestionChips
            chips={["Yes, show me the numbers", "No thanks"]}
            onSelect={handleChipSelect}
          />
        );
      case "property_details":
        return (
          <PropertyDetailsForm
            onSubmit={handlePropertySubmit}
            initialValues={propertyLookup.data || undefined}
            loading={propertyLookup.loading}
          />
        );
      case "savings_display":
        // Savings card is now rendered inline as a message
        return null;

      // Stage 2
      case "q2_rents_over_14":
        return (
          <SuggestionChips
            chips={["Yes", "No"]}
            onSelect={handleChipSelect}
          />
        );
      case "q2_home_office":
        return (
          <SuggestionChips
            chips={["Yes", "No"]}
            onSelect={handleChipSelect}
          />
        );
      case "q2_home_office_conflict":
        return (
          <SuggestionChips
            chips={["Continue, I understand", "Stop and consult my advisor"]}
            onSelect={handleChipSelect}
          />
        );
      case "q2_business_purpose":
        return <BusinessPurposeSelector onSubmit={handleBusinessPurposes} />;
      case "q2_planned_days":
        return <PlannedDaysInput onSubmit={handlePlannedDays} />;
      case "q2_event_planner":
        return (
          <EventPlannerForm
            totalDays={engagement.plannedDays || 4}
            businessPurposes={engagement.businessPurposes}
            onSubmit={handleEventsSubmit}
          />
        );
      // Stage 3
      case "s3_generating":
        return (
          <DocGenerationProgress
            onComplete={() => {
              if (generatedDocs) {
                addMessage({
                  role: "bot",
                  type: "doc-package",
                  content: "",
                });
                setStep("s3_documents_ready");
              }
            }}
          />
        );
      case "s3_documents_ready":
        return null;

      case "q2_qualified":
        return engagement.fairMarketDailyRate ? (
          <QualificationSummary
            plannedDays={engagement.plannedEvents.reduce((sum, e) => sum + (e.days || 1), 0) || engagement.plannedDays || 0}
            dailyRate={engagement.fairMarketDailyRate}
            totalIncome={engagement.estimatedAnnualIncome!}
            taxSavings={engagement.estimatedTaxSavings!}
            eventCount={engagement.plannedEvents.length}
            onGenerateDocs={() => {
              addMessage({
                role: "user",
                type: "text",
                content: "Generate my documents",
              });
              setStage("documents");
              setStep("s3_generating");

              // Kick off generation
              generateDocumentPackage(engagement, engagement.ownerName)
                .then((docs) => {
                  setGeneratedDocs(docs);
                })
                .catch(() => {
                  // Generation failed — still show the progress animation
                  // and let onComplete handle the transition
                });
            }}
          />
        ) : null;

      default:
        return null;
    }
  };

  // ── Render messages ──
  const renderMessage = (msg: (typeof messages)[0]) => {
    if (msg.type === "property-preview" && msg.data?.address) {
      const addr = msg.data.address as string;
      return (
        <div key={msg.id} className="pl-11">
          <div className="bg-white card-brutal rounded-md overflow-hidden shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/streetview?address=${encodeURIComponent(addr)}`}
              alt="Street view of property"
              className="w-full h-40 object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div className="px-4 py-3">
              <p className="text-black text-body-md font-medium leading-snug">{addr}</p>
              {propertyLookup.meta && (
                <p className="text-charcoal/60 text-body-sm mt-1">
                  {[
                    propertyLookup.meta.propertyType && propertyLookup.meta.propertyType.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
                    propertyLookup.meta.yearBuilt && `Built ${propertyLookup.meta.yearBuilt}`,
                    propertyLookup.meta.lotSqft && `${(propertyLookup.meta.lotSqft / 43560).toFixed(2)} acre lot`,
                  ].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }
    if (msg.type === "disqualification") {
      return (
        <DisqualificationCard
          key={msg.id}
          title="Not Eligible"
          message={msg.content}
          onExploreOther={() => {}}
        />
      );
    }
    if (msg.type === "warning") {
      return <WarningBanner key={msg.id} message={msg.content} />;
    }
    if (msg.type === "doc-package" && generatedDocs) {
      return <DocumentPackageCard key={msg.id} documents={generatedDocs} />;
    }
    if (msg.type === "savings-card" && msg.data) {
      const d = msg.data as {
        dailyRate: number;
        totalRentalIncome: number;
        estimatedTaxSavings: number;
        days: number;
        compSources: typeof engagement.compSources;
      };
      // If this is the latest savings-card and we're on savings_display, show interactive version
      const isActive = step === "savings_display" &&
        msg.id === messages.filter((m) => m.type === "savings-card").at(-1)?.id;
      return (
        <SavingsCard
          key={msg.id}
          dailyRate={d.dailyRate}
          totalRentalIncome={d.totalRentalIncome}
          estimatedTaxSavings={d.estimatedTaxSavings}
          days={d.days}
          compSources={d.compSources}
          onContinue={isActive ? () => {
            addMessage({
              role: "user",
              type: "text",
              content: "Yes, check my eligibility",
            });
            setStep("proceed_to_qualify");
            startStage2();
          } : undefined}
          onSaveForLater={isActive ? () => {
            addMessage({
              role: "user",
              type: "text",
              content: "Save for later",
            });
            setStep("exit");
            botSay(
              "Got it — we've saved your results. You can come back anytime."
            );
          } : undefined}
        />
      );
    }
    return msg.role === "bot" ? (
      <BotMessage key={msg.id} content={msg.content} />
    ) : (
      <UserMessage key={msg.id} content={msg.content} />
    );
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-[720px] mx-auto bg-yellow">
      {/* Header */}
      <header className="shrink-0 px-4 py-3 bg-yellow">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-8 h-8 rounded-md border-2 border-black bg-white flex items-center justify-center shrink-0 cursor-pointer hover:bg-yellow"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
            <span className="text-yellow text-lg font-bold font-heading">D</span>
          </div>
          <div>
            <h1 className="font-heading text-heading-sm text-black">HeyDrew!</h1>
            <p className="text-subtext-sm text-charcoal/60">
              Augusta Rule Strategy
              {stage === "qualification" && " — Qualification"}
              {stage === "documents" && " — Documents"}
            </p>
          </div>
        </div>
      </header>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        {messages.map(renderMessage)}
        {isTyping && <TypingIndicator />}
        {!isTyping && renderActiveInput()}
      </div>

    </div>
  );
}
