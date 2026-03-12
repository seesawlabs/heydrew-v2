import { NextRequest, NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("place_id");

  if (!placeId) {
    return NextResponse.json({ error: "place_id required" }, { status: 400 });
  }

  if (!GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: "Google Places API key not configured" },
      { status: 500 }
    );
  }

  const detailsUrl = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json"
  );
  detailsUrl.searchParams.set("place_id", placeId);
  detailsUrl.searchParams.set(
    "fields",
    "formatted_address,address_components,geometry"
  );
  detailsUrl.searchParams.set("key", GOOGLE_API_KEY);

  const res = await fetch(detailsUrl.toString());
  const data = await res.json();

  if (data.status !== "OK") {
    return NextResponse.json(
      { error: data.error_message || data.status },
      { status: 502 }
    );
  }

  const result = data.result;
  const components = result.address_components || [];

  const get = (type: string) =>
    components.find((c: { types: string[] }) => c.types.includes(type))
      ?.short_name || "";

  return NextResponse.json({
    formattedAddress: result.formatted_address,
    streetNumber: get("street_number"),
    street: get("route"),
    city: get("locality") || get("sublocality"),
    state: get("administrative_area_level_1"),
    zip: get("postal_code"),
    lat: result.geometry?.location?.lat,
    lng: result.geometry?.location?.lng,
  });
}
