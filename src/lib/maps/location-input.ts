export type ParsedLocation = {
  lat: number;
  lng: number;
};

function isValidCoordinatePair(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function parseCoordinatePair(value: string): ParsedLocation | null {
  const match = value.match(/(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/);
  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[2]);

  return isValidCoordinatePair(lat, lng) ? { lat, lng } : null;
}

export function parseLocationInput(rawValue: string | null | undefined): ParsedLocation | null {
  const value = rawValue?.trim() ?? '';
  if (!value) return null;

  const directCoordinates = parseCoordinatePair(value);
  if (directCoordinates) {
    return directCoordinates;
  }

  try {
    const url = new URL(value);
    const candidates = [
      url.searchParams.get('q'),
      url.searchParams.get('query'),
      url.searchParams.get('ll'),
      decodeURIComponent(url.pathname),
    ].filter((candidate): candidate is string => Boolean(candidate));

    for (const candidate of candidates) {
      const parsed = parseCoordinatePair(candidate);
      if (parsed) return parsed;
    }

    const atMatch = url.href.match(/@(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/);
    if (atMatch) {
      const lat = Number(atMatch[1]);
      const lng = Number(atMatch[2]);
      if (isValidCoordinatePair(lat, lng)) {
        return { lat, lng };
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function formatCoordinates(lat: number | null, lng: number | null) {
  if (lat === null || lng === null) return '';
  return `${lat}, ${lng}`;
}

export function isGoogleMapsUrl(rawValue: string | null | undefined) {
  const value = rawValue?.trim() ?? '';
  if (!value) return false;

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return host.includes('google.com') || host.includes('goo.gl') || host.includes('maps.app.goo.gl');
  } catch {
    return false;
  }
}

export function buildGoogleMapsHref({
  rawValue,
  lat,
  lng,
  municipio,
}: {
  rawValue?: string | null;
  lat?: number | null;
  lng?: number | null;
  municipio?: string | null;
}) {
  const value = rawValue?.trim() ?? '';

  if (isGoogleMapsUrl(value)) {
    return value;
  }

  const parsed = parseLocationInput(value);
  if (parsed) {
    return `https://maps.google.com/?q=${parsed.lat},${parsed.lng}`;
  }

  if (lat !== null && lat !== undefined && lng !== null && lng !== undefined) {
    return `https://maps.google.com/?q=${lat},${lng}`;
  }

  if (value) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      municipio ? `${value}, ${municipio}` : value
    )}`;
  }

  return null;
}
