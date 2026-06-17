import type { Refuge } from '../types';

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const REFUGES_API = 'https://www.refuges.info/api';

export interface GeoArea {
  south: number;
  north: number;
  west: number;
  east: number;
  name: string;
}

export async function geocodeArea(query: string): Promise<GeoArea> {
  const url = `${NOMINATIM}/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=fr`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error('Geocoding service unavailable');
  const data = await res.json();
  if (!data.length) throw new Error(`No location found for "${query}"`);
  const { boundingbox, display_name } = data[0];
  // boundingbox: [south, north, west, east]
  return {
    south: parseFloat(boundingbox[0]),
    north: parseFloat(boundingbox[1]),
    west: parseFloat(boundingbox[2]),
    east: parseFloat(boundingbox[3]),
    name: display_name.split(',')[0].trim(),
  };
}

export async function fetchRefuges(area: GeoArea): Promise<Refuge[]> {
  const { west, south, east, north } = area;
  const url = `${REFUGES_API}/bbox?bb=${west},${south},${east},${north}&format=geojson&nb_points=100&detail=complet`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch refuges');
  const data = await res.json();
  return (data.features ?? []) as Refuge[];
}
