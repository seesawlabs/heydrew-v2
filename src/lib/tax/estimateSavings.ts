const STATE_TAX_RATES: Record<string, number> = {
  CA: 0.093, NY: 0.0685, TX: 0, FL: 0, WA: 0,
  IL: 0.0495, PA: 0.0307, OH: 0.04, GA: 0.055,
  NC: 0.0525, NJ: 0.0637, VA: 0.0575, MA: 0.05,
  CO: 0.044, AZ: 0.025, TN: 0, NV: 0,
  OR: 0.099, MN: 0.0985, WI: 0.0765, MD: 0.0575,
  SC: 0.065, AL: 0.05, KY: 0.05, LA: 0.0425,
  OK: 0.0475, CT: 0.0699, UT: 0.0485, IA: 0.06,
  MS: 0.05, AR: 0.055, KS: 0.057, NE: 0.0684,
  NM: 0.059, ID: 0.058, HI: 0.11, WV: 0.065,
  ME: 0.0715, NH: 0, MT: 0.0675, RI: 0.0599,
  DE: 0.066, SD: 0, ND: 0.029, AK: 0, VT: 0.0875,
  WY: 0, DC: 0.0895, IN: 0.0315, MO: 0.054,
  MI: 0.0425,
};

export function estimateMarginalRate(
  entityType: string,
  state: string,
  incomeRange?: string
): number {
  let federalRate: number;
  switch (entityType) {
    case "c_corp":
      federalRate = 0.21;
      break;
    case "s_corp":
    case "llc":
    case "partnership":
    default:
      federalRate =
        incomeRange === "under_100k" ? 0.22
        : incomeRange === "100k_200k" ? 0.24
        : incomeRange === "200k_400k" ? 0.32
        : incomeRange === "400k_plus" ? 0.35
        : 0.32;
      break;
  }

  const stateRate = STATE_TAX_RATES[state] ?? 0.05;
  return federalRate + stateRate;
}

export function calculateAugustaRate(
  compRates: number[],
  plannedDays: number = 14,
  marginalTaxRate: number = 0.32
): {
  dailyRate: number;
  totalRentalIncome: number;
  estimatedTaxSavings: number;
  methodology: string;
  compCount: number;
} {
  if (compRates.length === 0) {
    return {
      dailyRate: 0,
      totalRentalIncome: 0,
      estimatedTaxSavings: 0,
      methodology: "No comparable data provided",
      compCount: 0,
    };
  }

  const sorted = [...compRates].sort((a, b) => a - b);
  const p10 = Math.floor(sorted.length * 0.1);
  const p90 = Math.ceil(sorted.length * 0.9);
  const trimmed = sorted.slice(p10, Math.max(p90, p10 + 1));

  const median = trimmed[Math.floor(trimmed.length / 2)];
  const dailyRate = Math.round(median / 25) * 25;

  const totalRentalIncome = dailyRate * plannedDays;
  const estimatedTaxSavings = Math.round(totalRentalIncome * marginalTaxRate);

  return {
    dailyRate,
    totalRentalIncome,
    estimatedTaxSavings,
    methodology: `Median of ${trimmed.length} comparable listings (trimmed 10th-90th percentile), rounded to nearest $25`,
    compCount: compRates.length,
  };
}
