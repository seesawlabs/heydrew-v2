import { NextRequest, NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input");

  if (!input || input.length < 3) {
    return NextResponse.json({ predictions: [] });
  }

  if (!GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: "Google Places API key not configured" },
      { status: 500 }
    );
  }

  // Autocomplete — restrict to addresses in the US
  const autocompleteUrl = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json"
  );
  autocompleteUrl.searchParams.set("input", input);
  autocompleteUrl.searchParams.set("types", "address");
  autocompleteUrl.searchParams.set("components", "country:us");
  autocompleteUrl.searchParams.set("key", GOOGLE_API_KEY);

  const res = await fetch(autocompleteUrl.toString());
  const data = await res.json();

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    return NextResponse.json(
      { error: data.error_message || data.status },
      { status: 502 }
    );
  }

  const predictions = (data.predictions || []).map(
    (p: { place_id: string; description: string }) => ({
      placeId: p.place_id,
      description: p.description,
    })
  );

  return NextResponse.json({ predictions });
}
