import { NextResponse } from 'next/server';

const GOOGLE_PLACES_API = 'https://maps.googleapis.com/maps/api/place';

function formatType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function POST(request: Request) {
  try {
    const { query, city, region } = await request.json();

    if (!query || (!city && !region)) {
      return NextResponse.json(
        { error: 'Zadej obor/klíčová slova a alespoň město nebo kraj.' },
        { status: 400 },
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API klíč není nakonfigurován.' },
        { status: 500 },
      );
    }

    const parts = [query];
    if (city) parts.push(city);
    if (region) parts.push(region);
    const searchQuery = parts.join(', ');
    const searchUrl = `${GOOGLE_PLACES_API}/textsearch/json?query=${encodeURIComponent(searchQuery)}&language=cs&key=${apiKey}`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (searchData.status !== 'OK') {
      if (searchData.status === 'ZERO_RESULTS') {
        return NextResponse.json({ leads: [] });
      }
      return NextResponse.json(
        { error: `Google API error: ${searchData.status} — ${searchData.error_message || ''}` },
        { status: 502 },
      );
    }

    const places = (searchData.results || []).slice(0, 10);

    const detailResponses = await Promise.allSettled(
      places.map((place: any) =>
        fetch(
          `${GOOGLE_PLACES_API}/details/json?place_id=${place.place_id}&language=cs&key=${apiKey}`,
        ).then((r) => r.json()),
      ),
    );

    const leads: Array<{
      companyName: string;
      phone: string;
      industry: string;
      city: string;
    }> = [];

    for (const result of detailResponses) {
      if (result.status !== 'fulfilled') continue;

      const detail = result.value;
      if (detail.status !== 'OK') continue;

      const companyName = detail.result.name;
      const phone =
        detail.result.international_phone_number ||
        detail.result.formatted_phone_number ||
        '';
      const website = detail.result.website;

      if (!phone || website) continue;

      const comps: Array<{ long_name: string; short_name: string; types: string[] }> =
        detail.result.address_components || [];

      const cityComponent = comps.find((c) => c.types.includes('locality'));
      const regionComponent = comps.find((c) =>
        c.types.includes('administrative_area_level_1'),
      );

      if (
        region &&
        regionComponent &&
        !regionComponent.long_name
          .toLowerCase()
          .includes(region.toLowerCase()) &&
        !region.toLowerCase().includes(regionComponent.long_name.toLowerCase())
      ) {
        continue;
      }

      const cityName = cityComponent?.long_name || city;

      const type = detail.result.types?.[0] || query;
      const industry = formatType(type);

      leads.push({ companyName, phone, industry, city: cityName });
    }

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Generate leads error:', error);
    return NextResponse.json(
      { error: 'Interní chyba serveru.' },
      { status: 500 },
    );
  }
}
