"use client";

interface QualificationSummaryProps {
  plannedDays: number;
  dailyRate: number;
  totalIncome: number;
  taxSavings: number;
  eventCount: number;
  onGenerateDocs: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function QualificationSummary({
  plannedDays,
  dailyRate,
  totalIncome,
  taxSavings,
  eventCount,
  onGenerateDocs,
}: QualificationSummaryProps) {
  return (
    <div className="pl-11">
      <div className="bg-sage border-2 border-black rounded-xl card-brutal-lg p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow border-2 border-black flex items-center justify-center">
            <span className="text-black text-xl">&#10003;</span>
          </div>
          <div>
            <h3 className="font-heading text-heading-md text-black">
              You&apos;re fully qualified
            </h3>
            <p className="text-body-sm text-charcoal/60">
              Here&apos;s your Augusta Rule plan
            </p>
          </div>
        </div>

        {/* Summary grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border-2 border-black rounded-xl p-3 text-center">
            <p className="text-subtext-sm text-charcoal/60">Rental days</p>
            <p className="font-heading text-heading-lg text-black font-bold">{plannedDays}</p>
          </div>
          <div className="bg-white border-2 border-black rounded-xl p-3 text-center">
            <p className="text-subtext-sm text-charcoal/60">Events planned</p>
            <p className="font-heading text-heading-lg text-black font-bold">{eventCount}</p>
          </div>
          <div className="bg-white border-2 border-black rounded-xl p-3 text-center">
            <p className="text-subtext-sm text-charcoal/60">Daily rate</p>
            <p className="font-heading text-heading-lg text-black font-bold">
              {formatCurrency(dailyRate)}
            </p>
          </div>
          <div className="bg-yellow border-2 border-black rounded-xl p-3 text-center">
            <p className="text-subtext-sm text-charcoal/60">Tax-free income</p>
            <p className="font-heading text-heading-lg text-black font-bold">
              {formatCurrency(totalIncome)}
            </p>
          </div>
        </div>

        {/* Tax savings callout */}
        <div className="bg-white border-2 border-black rounded-xl p-4 text-center">
          <p className="text-body-sm text-charcoal/60">Estimated tax savings</p>
          <p className="font-heading text-heading-xl text-black font-bold">
            ~{formatCurrency(taxSavings)}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onGenerateDocs}
          className="w-full py-3 min-h-[44px] bg-black text-white rounded-xl
            font-body text-body-lg font-semibold
            btn-brutal-lg"
        >
          Generate my documents
        </button>
      </div>
    </div>
  );
}
