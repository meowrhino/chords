// Rate limiting, sanitization, tripcode — adapted from piuler v2

const rateLimitMap = new Map<string, number[]>();
const MAX_PER_MINUTE = 5;
const WINDOW_MS = 60_000;

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip)?.filter(t => now - t < WINDOW_MS) || [];

  if (timestamps.length >= MAX_PER_MINUTE) {
    const oldest = timestamps[0];
    return { allowed: false, retryAfter: Math.ceil((oldest + WINDOW_MS - now) / 1000) };
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  // cleanup
  if (rateLimitMap.size > 100) {
    for (const [key, ts] of rateLimitMap) {
      if (ts.every(t => now - t >= WINDOW_MS)) rateLimitMap.delete(key);
    }
  }

  return { allowed: true };
}

export function sanitizeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

export async function generateTripcode(secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hash);
  let num = BigInt(0);
  for (const b of bytes.slice(0, 8)) num = (num << BigInt(8)) | BigInt(b);
  return num.toString(36).slice(0, 8);
}

export function parseUsername(raw: string): { username: string; secret: string | null } {
  const idx = raw.indexOf('#');
  if (idx < 0) return { username: raw.trim(), secret: null };
  return { username: raw.slice(0, idx).trim(), secret: raw.slice(idx + 1) };
}

export function generateSlug(artist: string, title: string): string {
  return (artist + '-' + title)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}
