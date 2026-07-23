// URL scraper for chord sites (lado Worker).
// Aquí solo vive lo que necesita el runtime: allowlist de dominios + fetch.
// El parseo HTML → ChordPro está en engine/scrapers.js, que es JS puro y por
// tanto lo comparten el Worker y el CLI local (scripts/import-url.mjs).
// @ts-ignore — JS module, bundled at deploy.
import { parseByDomain, isAllowedDomain, browserHeaders, ALLOWED_DOMAINS } from '../engine/scrapers.js';

interface ScrapeResult {
  title: string;
  artist: string;
  key?: string;
  lang?: string;
  content: string;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export async function scrapeUrl(url: string, cookie?: string): Promise<ScrapeResult> {
  const domain = getDomain(url);

  if (!isAllowedDomain(domain)) {
    throw new Error(`Domain not supported: ${domain}. Supported: ${ALLOWED_DOMAINS.join(', ')}`);
  }

  const response = await fetch(url, { headers: browserHeaders(cookie) });
  if (!response.ok) throw new Error(`Failed to fetch URL: ${response.status}`);

  return parseByDomain(domain, await response.text());
}
