import { NextRequest, NextResponse } from "next/server";

const AIRDNA_HOST = "airdna1.p.rapidapi.com";

interface AirDNAComp {
  title?: string;
  cover_img?: string;
  listing_url?: string;
  bedrooms?: number;
  bathrooms?: number;
  accommodates?: number;
  property_type?: string;
  room_type?: string;
  rating?: number;
  reviews?: number;
  distance_meters?: number;
  stats?: {
    adr?: { ltm?: number };
  };
}

interface AirDNAProperty {
  title?: string;
  images?: string[];
  airbnb_property_id?: string;
  bedrooms?: number;
  bathrooms?: number;
  accommodates?: number;
  listing_type?: string;
  rating?: number;
  reviews?: number;
  average_daily_rate_ltm?: number;
  occupancy_rate_ltm?: number;
  revenue_ltm?: number;
  market_name?: string;
}

interface Comp {
  source: string;
  listingTitle: string;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  url: string;
  location: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  propertyType: string;
  distanceMeters?: number;
}

interface RentalizerResult {
  comps: Comp[];
  estimatedAdr: number;
  marketName: string;
}

async function fetchRentalizerComps(
  address: string,
  apiKey: string
): Promise<RentalizerResult> {
  const url = new URL(`https://${AIRDNA_HOST}/rentalizer`);
  url.searchParams.set("address", address);

  const res = await fetch(url.toString(), {
    headers: {
      "x-rapidapi-host": AIRDNA_HOST,
      "x-rapidapi-key": apiKey,
    },
  });

  if (!res.ok) return { comps: [], estimatedAdr: 0, marketName: "" };
  const json = await res.json();
  const data = json?.data;
  if (!data) return { comps: [], estimatedAdr: 0, marketName: "" };

  const estimatedAdr = data.property_statistics?.adr?.ltm || 0;
  const marketName = data.combined_market_info?.airdna_market_name || "";
  const rawComps: AirDNAComp[] = data.comps || [];

  const comps: Comp[] = rawComps
    .filter((c) => c.title && c.stats?.adr?.ltm && c.stats.adr.ltm > 0)
    .map((c) => ({
      source: "airbnb",
      listingTitle: c.title || "Airbnb rental",
      pricePerNight: Math.round(c.stats?.adr?.ltm || 0),
      bedrooms: c.bedrooms || 0,
      bathrooms: c.bathrooms || 0,
      url: c.listing_url || "",
      location: "",
      imageUrl: c.cover_img || "",
      rating: c.rating || 0,
      reviews: c.reviews || 0,
      propertyType: c.property_type || c.room_type || "",
      distanceMeters: c.distance_meters,
    }));

  return { comps, estimatedAdr, marketName };
}

async function fetchPropertySearch(
  location: string,
  bedrooms: number,
  bathrooms: number,
  apiKey: string,
  bedroomMax?: number
): Promise<Comp[]> {
  const url = new URL(`https://${AIRDNA_HOST}/properties`);
  url.searchParams.set("location", location);
  url.searchParams.set("page_size", "10");
  if (bedrooms > 0) {
    url.searchParams.set("bedrooms_min", String(bedrooms));
    url.searchParams.set("bedrooms_max", String(bedroomMax ?? bedrooms + 1));
  }
  if (bathrooms > 0) {
    url.searchParams.set("bathrooms_min", String(bathrooms));
  }

  let res = await fetch(url.toString(), {
    headers: {
      "x-rapidapi-host": AIRDNA_HOST,
      "x-rapidapi-key": apiKey,
    },
  });

  // Retry once on rate limit (429) after a delay
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 2000));
    res = await fetch(url.toString(), {
      headers: {
        "x-rapidapi-host": AIRDNA_HOST,
        "x-rapidapi-key": apiKey,
      },
    });
  }

  if (!res.ok) return [];
  const json = await res.json();
  const listings: AirDNAProperty[] = json?.listings || [];

  return listings
    .filter((l) => l.title && l.average_daily_rate_ltm && l.average_daily_rate_ltm > 0)
    .map((l) => ({
      source: "airbnb",
      listingTitle: l.title || "Airbnb rental",
      pricePerNight: Math.round(l.average_daily_rate_ltm || 0),
      bedrooms: l.bedrooms || 0,
      bathrooms: l.bathrooms || 0,
      url: l.airbnb_property_id
        ? `https://www.airbnb.com/rooms/${l.airbnb_property_id}`
        : "",
      location: l.market_name || "",
      imageUrl: l.images?.[0] || "",
      rating: l.rating || 0,
      reviews: l.reviews || 0,
      propertyType: l.listing_type || "",
    }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address") || "";
  const bedrooms = parseInt(searchParams.get("bedrooms") || "0", 10);
  const bathrooms = parseInt(searchParams.get("bathrooms") || "0", 10);
  const city = searchParams.get("city") || "";
  const state = searchParams.get("state") || "";

  console.log("[comps] params:", { address, bedrooms, bathrooms, city, state });

  if (!address && !city) {
    return NextResponse.json(
      { error: "address or city is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "RAPIDAPI_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    let comps: Comp[] = [];
    let estimatedAdr = 0;

    // Build location string for property search
    // If city/state weren't provided (e.g. Google Places was down),
    // try to parse them from the address string
    let resolvedCity = city;
    let resolvedState = state;
    if (!resolvedCity && address) {
      // Typical format: "1234 Main St, Denver, CO 80210, USA"
      const parts = address.split(",").map((s) => s.trim());
      if (parts.length >= 3) {
        resolvedCity = parts[parts.length - 3]; // city
        const stateZip = parts[parts.length - 2]; // "CO 80210" or "CO"
        const stateMatch = stateZip.match(
          /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/i
        );
        if (stateMatch) resolvedState = stateMatch[1].toUpperCase();
      }
    }

    const location = resolvedCity
      ? resolvedState ? `${resolvedCity}, ${resolvedState}` : resolvedCity
      : "";

    console.log("[comps] resolved location:", { resolvedCity, resolvedState, location });

    // Step 1: Get rentalizer data (ADR estimate + market name)
    let marketName = "";
    let rentalizerComps: Comp[] = [];
    if (address) {
      const result = await fetchRentalizerComps(address, apiKey);
      estimatedAdr = result.estimatedAdr;
      marketName = result.marketName;
      rentalizerComps = result.comps;
    }

    // Bedroom match threshold: comp must be within this range to be considered valid
    const minBeds = bedrooms > 0 ? Math.max(bedrooms - 1, 1) : 0;
    const maxBeds = bedrooms > 0 ? bedrooms + 2 : 999;
    const isValidComp = (c: Comp) =>
      bedrooms === 0 || (c.bedrooms >= minBeds && c.bedrooms <= maxBeds);

    const debug = {
      params: { address: address.slice(0, 40), bedrooms, bathrooms, city, state },
      resolvedLocation: location,
      rentalizerAdr: estimatedAdr,
      rentalizerMarket: marketName,
      rentalizerCompsCount: rentalizerComps.length,
      rentalizerBedrooms: rentalizerComps.map((c) => c.bedrooms),
      locationsSearched: [] as string[],
      searchResults: [] as { loc: string; step: number; raw: number; valid: number }[],
    };

    // Step 2: Property search
    // AirDNA rate-limits at ~1 req/sec, so wait after the rentalizer call.
    // Also, AirDNA only recognizes metro areas (not suburbs like "Lakeway"),
    // so prefer the rentalizer's market name (e.g. "Austin") over the city.
    await new Promise((r) => setTimeout(r, 2000));

    const marketLocation = marketName && resolvedState ? `${marketName}, ${resolvedState}` : "";
    const locationsToTry = [
      marketLocation,  // metro area first (more likely to work)
      location !== marketLocation ? location : "",  // city fallback if different
    ].filter(Boolean);

    debug.locationsSearched = locationsToTry;

    // Broadened bedroom range, no bathroom filter — filter locally with isValidComp
    const searchBedMin = bedrooms > 0 ? Math.max(bedrooms - 1, 1) : 0;
    const searchBedMax = bedrooms > 0 ? bedrooms + 2 : 0;

    for (const loc of locationsToTry) {
      const results = await fetchPropertySearch(loc, searchBedMin, 0, apiKey, searchBedMax);
      const valid = results.filter(isValidComp);
      debug.searchResults.push({ loc, step: 2, raw: results.length, valid: valid.length });
      if (valid.length > 0) {
        comps = valid;
        break;
      }
    }

    // Step 5: Filter rentalizer comps strictly — never show wildly mismatched comps
    if (comps.length === 0 && rentalizerComps.length > 0) {
      comps = rentalizerComps.filter(isValidComp);
    }

    // Step 6: No valid comps found — return empty rates so client uses its own estimate
    if (comps.length === 0) {
      return NextResponse.json({
        comps: [],
        rates: [],
        estimatedAdr,
        totalFound: 0,
        _debug: debug,
      });
    }

    // Score comps: prefer closer bedroom match, then higher rate
    comps.sort((a, b) => {
      const bedDiff = Math.abs(a.bedrooms - bedrooms) - Math.abs(b.bedrooms - bedrooms);
      if (bedDiff !== 0) return bedDiff;
      return b.pricePerNight - a.pricePerNight;
    });
    const topComps = comps.slice(0, 5);

    return NextResponse.json({
      comps: topComps,
      rates: topComps.map((c) => c.pricePerNight),
      estimatedAdr,
      totalFound: comps.length,
      _debug: debug,
    });
  } catch (err) {
    console.error("Comps API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch comps" },
      { status: 500 }
    );
  }
}
