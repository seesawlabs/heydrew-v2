import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "address is required" },
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
    const url = new URL(
      "https://realtor16.p.rapidapi.com/property/details"
    );
    url.searchParams.set("address", address);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-rapidapi-host": "realtor16.p.rapidapi.com",
        "x-rapidapi-key": apiKey,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Realtor API error:", response.status, text);
      return NextResponse.json(
        { error: "Property lookup failed", status: response.status },
        { status: 502 }
      );
    }

    const json = await response.json();
    const data = json?.data;

    if (!data?.description) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const desc = data.description;
    const tags: string[] = Array.isArray(data.tags) ? data.tags : [];

    // Map tags to our amenity list
    const amenities: string[] = [];
    const hasPool = tags.includes("pool") || (desc.pool && !Array.isArray(desc.pool) && desc.pool !== false);
    if (hasPool) amenities.push("Pool");
    if (tags.includes("hot_tub")) amenities.push("Hot tub");
    if (tags.includes("outdoor_kitchen") || tags.includes("grill"))
      amenities.push("Outdoor kitchen / grill");
    if (tags.includes("home_theater") || tags.includes("media_room"))
      amenities.push("Home theater");
    if (
      tags.includes("community_outdoor_space") ||
      tags.includes("large_lot") ||
      (desc.lot_sqft && desc.lot_sqft > 8000)
    )
      amenities.push("Large yard / patio");
    if (
      tags.includes("waterfront") ||
      tags.includes("ocean_view") ||
      tags.includes("lake_view")
    )
      amenities.push("Waterfront / view");
    if (tags.includes("game_room") || tags.includes("recreation_room"))
      amenities.push("Game room");
    if (tags.includes("wine_cellar") || tags.includes("wine_room"))
      amenities.push("Wine cellar");

    return NextResponse.json({
      bedrooms: desc.beds || 0,
      bathrooms: desc.baths || desc.baths_full || 0,
      squareFeet: desc.sqft || 0,
      amenities,
      yearBuilt: desc.year_built || null,
      propertyType: desc.type || null,
      stories: desc.stories || null,
      garage: desc.garage || null,
      lotSqft: desc.lot_sqft || null,
      lastSoldPrice: data.last_sold_price || null,
      lastSoldDate: data.last_sold_date || null,
    });
  } catch (err) {
    console.error("Property API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch property details" },
      { status: 500 }
    );
  }
}
