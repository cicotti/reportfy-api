export function formatDbNull(value: string | undefined): string | null {
  if (!value || value.trim() === '') return null;
  return value.trim();
}

export function getCurrentWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

export function getNextWeekStart(): string {
  const currentStart = new Date(getCurrentWeekStart());
  currentStart.setDate(currentStart.getDate() + 7);
  return currentStart.toISOString().split('T')[0];
}

export function getNextWeekEnd(): string {
  const nextStart = new Date(getNextWeekStart());
  nextStart.setDate(nextStart.getDate() + 6);
  return nextStart.toISOString().split('T')[0];
}

export function convertLocationToLatLong(location: string): { lat: string; long: string } | undefined {
  let result: { lat: string; long: string } | undefined = undefined;
  if (location) {    
    const m = location.match(/\(?\s*([^,()]+)\s*,\s*([^,()]+)\s*\)?/);
    if (m) {
      result = { lat: String(m[1]), long: String(m[2]) };
    }
  }
  return result;
}