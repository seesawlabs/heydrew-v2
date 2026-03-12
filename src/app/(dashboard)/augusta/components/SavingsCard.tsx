"use client";

import Image from "next/image";

interface CompSource {
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

interface SavingsCardProps {
  dailyRate: number;
  totalRentalIncome: number;
  estimatedTaxSavings: number;
  days: number;
  compSources?: CompSource[];
  onContinue?: () => void;
  onSaveForLater?: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDistance(meters?: number): string {
  if (!meters) return "";
  const miles = meters / 1609.34;
  if (miles < 0.1) return "< 0.1 mi away";
  return `${miles.toFixed(1)} mi away`;
}

export function SavingsCard({
  dailyRate,
  totalRentalIncome,
  estimatedTaxSavings,
  days,
  compSources,
  onContinue,
  onSaveForLater,
}: SavingsCardProps) {
  const allComps = compSources || [];
  const hasRealComps = allComps.length > 0 && allComps[0]?.source === "airbnb";

  return (
    <div className="pl-11">
      <div className="bg-yellow border-2 border-black rounded-xl card-brutal-lg p-6 space-y-5">
        {/* Hero number */}
        <div className="text-center space-y-1">
          <p className="text-subtext-sm text-black uppercase tracking-wide font-semibold">
            Your potential tax-free income
          </p>
          <p className="font-heading text-[40px] font-extrabold text-black leading-tight">
            {formatCurrency(totalRentalIncome)}
          </p>
          <p className="text-body-sm text-charcoal/60">
            {formatCurrency(dailyRate)}/day &times; {days} days
          </p>
        </div>

        {/* Tax savings */}
        <div className="bg-white border-2 border-black rounded-xl p-4 text-center">
          <p className="text-body-sm text-charcoal/60">Estimated tax savings</p>
          <p className="font-heading text-heading-xl text-black font-bold">
            ~{formatCurrency(estimatedTaxSavings)}
          </p>
          <p className="text-subtext-sm text-charcoal/60 mt-1">
            Based on your estimated marginal tax rate
          </p>
        </div>

        {/* Comparable listings */}
        {allComps.length > 0 && (
          <div className="space-y-3">
            <p className="text-subtext-sm text-charcoal/60 uppercase tracking-wide font-semibold">
              {hasRealComps ? "Comparable Airbnb rentals near you" : "Based on comparable rentals"}
            </p>
            <div className="space-y-2">
              {allComps.map((comp, i) => (
                <div
                  key={i}
                  className="flex gap-3 bg-white border-2 border-black rounded-xl p-2.5 hover:bg-sage transition-colors"
                >
                  {/* Thumbnail */}
                  {comp.imageUrl && (
                    <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-black">
                      <Image
                        src={comp.imageUrl}
                        alt={comp.listingTitle}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    {comp.url ? (
                      <a
                        href={comp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body-sm text-black font-medium line-clamp-1 hover:underline"
                      >
                        {comp.listingTitle}
                      </a>
                    ) : (
                      <p className="text-body-sm text-black font-medium line-clamp-1">
                        {comp.listingTitle}
                      </p>
                    )}
                    <p className="text-subtext-xs text-charcoal/60 mt-0.5">
                      {comp.bedrooms > 0 && `${comp.bedrooms} bed`}
                      {comp.bathrooms > 0 && ` · ${comp.bathrooms} bath`}
                      {comp.rating ? ` · ★ ${comp.rating}` : ""}
                      {comp.reviews ? ` (${comp.reviews})` : ""}
                    </p>
                    <p className="text-subtext-xs text-charcoal/60 mt-0.5">
                      {formatDistance(comp.distanceMeters)}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="shrink-0 text-right self-center">
                    <p className="text-body-sm font-semibold text-black">
                      {formatCurrency(comp.pricePerNight)}
                    </p>
                    <p className="text-subtext-xs text-charcoal/60">/night avg</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-subtext-xs text-charcoal/60 text-center">
              Fair market daily rate based on {allComps.length} comparable rentals · Source: AirDNA
            </p>
          </div>
        )}

        {/* Explainer */}
        <p className="text-body-sm text-charcoal/60 text-center">
          Your business pays you rent for meetings held at your home.
          Under the Augusta Rule, that income is <strong className="text-black">completely tax-free</strong> to you,
          and your business gets to <strong className="text-black">deduct it</strong>.
        </p>

        {/* CTAs — only shown when interactive */}
        {(onContinue || onSaveForLater) && (
          <div className="space-y-3">
            {onContinue && (
              <button
                onClick={onContinue}
                className="w-full py-3 min-h-[44px] bg-black text-white rounded-xl
                  font-body text-body-lg font-semibold
                  btn-brutal-lg"
              >
                See if you qualify
              </button>
            )}
            {onSaveForLater && (
              <button
                onClick={onSaveForLater}
                className="w-full py-2 text-charcoal/60 text-body-sm font-semibold
                  hover:text-black transition-colors duration-150"
              >
                Save for later
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
