import { NextResponse } from 'next/server';

const PLACES_NEW = 'https://places.googleapis.com/v1/places:searchText';

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

    const body = {
      textQuery: searchQuery,
      languageCode: 'cs',
      pageSize: 10,
    };

    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.nationalPhoneNumber',
      'places.internationalPhoneNumber',
      'places.websiteUri',
      'places.types',
      'places.addressComponents',
    ].join(',');

    const res = await fetch(PLACES_NEW, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const msg = errBody?.error?.message || `HTTP ${res.status}`;
      return NextResponse.json(
        { error: `Chyba Google API: ${msg}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    const places: any[] = data.places || [];

    if (places.length === 0) {
      return NextResponse.json({ leads: [] });
    }

    const leads: Array<{
      companyName: string;
      phone: string;
      industry: string;
      city: string;
    }> = [];

    for (const place of places) {
      const companyName = place.displayName?.text || '';
      const phone =
        place.internationalPhoneNumber ||
        place.nationalPhoneNumber ||
        '';
      const website = place.websiteUri;

      if (!companyName || !phone || website) continue;

      const comps: Array<{
        longText: string;
        shortText: string;
        types: string[];
      }> = place.addressComponents || [];

      const cityComponent = comps.find((c) =>
        c.types.includes('locality'),
      );
      const regionComponent = comps.find((c) =>
        c.types.includes('administrative_area_level_1'),
      );

      if (
        region &&
        regionComponent &&
        !regionComponent.longText
          .toLowerCase()
          .includes(region.toLowerCase()) &&
        !region
          .toLowerCase()
          .includes(regionComponent.longText.toLowerCase())
      ) {
        continue;
      }

      const cityName = cityComponent?.longText || city;

      const type = place.types?.[0] || query;
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
