import { NextResponse } from 'next/server';

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

    // Try the new Places API (New) with minimal fields
    const res = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.types,places.addressComponents',
        },
        body: JSON.stringify({
          textQuery: searchQuery,
          languageCode: 'cs',
          pageSize: 10,
        }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      let detail = text;
      try {
        const json = JSON.parse(text);
        detail = json?.error?.message || json?.error?.status || text;
      } catch {}
      console.error('Google Places API error:', res.status, detail);

      // If new API fails, try legacy API as fallback
      if (detail.includes('REQUEST_DENIED') || detail.includes('not authorized')) {
        const legacyUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&language=cs&key=${apiKey}`;
        const legacyRes = await fetch(legacyUrl);
        const legacyData = await legacyRes.json();

        if (legacyData.status === 'OK' || legacyData.status === 'ZERO_RESULTS') {
          const places: any[] = legacyData.results || [];
          if (places.length === 0) return NextResponse.json({ leads: [] });

          const leads: Array<{
            companyName: string;
            phone: string;
            industry: string;
            city: string;
          }> = [];

          for (const place of places) {
            if (!place.place_id) continue;
            try {
              const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,international_phone_number,website,types,address_components&language=cs&key=${apiKey}`;
              const dRes = await fetch(detailUrl);
              const dData = await dRes.json();
              const d = dData.result || {};

              const companyName = d.name || '';
              const phone = d.international_phone_number || '';
              const website = d.website || '';
              if (!companyName || !phone || website) continue;

              const comps: Array<{ long_name: string; types: string[] }> =
                d.address_components || [];
              const cityComponent = comps.find((c: { types: string[] }) =>
                c.types.includes('locality'),
              );
              const regionComponent = comps.find((c: { types: string[] }) =>
                c.types.includes('administrative_area_level_1'),
              );

              if (
                region &&
                regionComponent &&
                !regionComponent.long_name.toLowerCase().includes(region.toLowerCase()) &&
                !region.toLowerCase().includes(regionComponent.long_name.toLowerCase())
              ) {
                continue;
              }

              leads.push({
                companyName,
                phone,
                industry: formatType(d.types?.[0] || query),
                city: cityComponent?.long_name || city,
              });
            } catch {}
          }

          return NextResponse.json({ leads });
        }

        // Both APIs failed
        return NextResponse.json(
          {
            error: `Google API error — novel API: ${detail}. Legacy API: ${legacyData.status} ${legacyData.error_message || ''}. Zkontroluj v Google Cloud Console: (1) https://console.cloud.google.com/apis/library — povol "Places API (New)" A "Places API" v tom samém projektu jako API key. (2) https://console.cloud.google.com/apis/credentials — API restrictions musí obsahovat obě API. (3) https://console.cloud.google.com/billing — musí být aktivní.`,
          },
          { status: 502 },
        );
      }

      return NextResponse.json(
        { error: `Google API error: ${detail}` },
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
