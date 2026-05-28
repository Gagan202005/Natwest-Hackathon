/**
 * Search Agent — mirrors Python backend/app/agents/search_agent.py.
 * Uses duck-duck-scrape for web search.
 */
import { WebResult } from '../types';

interface DdgResult {
  title?: string;
  description?: string;
  url?: string;
  [key: string]: any;
}

async function duckDuckGoSearch(query: string, maxResults: number): Promise<DdgResult[]> {
  try {
    // duck-duck-scrape has a CommonJS export
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { search, SafeSearchType } = require('duck-duck-scrape');
    const result = await search(query, { safeSearch: SafeSearchType.OFF, locale: 'en-us' });
    return (result?.results ?? []).slice(0, maxResults).map((r: any) => ({
      title: r.title ?? '',
      description: r.description ?? r.snippet ?? '',
      url: r.url ?? r.href ?? '',
    }));
  } catch (e) {
    console.warn(`[WARN] DuckDuckGo search failed: ${e}`);
    return [];
  }
}

async function duckDuckGoNews(query: string, maxResults: number): Promise<DdgResult[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { searchNews, SafeSearchType } = require('duck-duck-scrape');
    const result = await searchNews(query, { safeSearch: SafeSearchType.OFF });
    return (result?.results ?? []).slice(0, maxResults).map((r: any) => ({
      title: r.title ?? '',
      description: r.excerpt ?? r.description ?? '',
      url: r.url ?? '',
      date: r.date ?? '',
      source: r.source ?? '',
    }));
  } catch (e) {
    console.warn(`[WARN] DuckDuckGo news search failed: ${e}`);
    return [];
  }
}

export async function runSearchAgent(opts: {
  query: string;
  max_results?: number;
  time_filter?: string;
}): Promise<{ search_query: string; results: WebResult[]; count: number; error?: string }> {
  const { query, max_results = 5 } = opts;
  try {
    const raw = await duckDuckGoSearch(query, max_results);
    const results: WebResult[] = raw.map((r) => ({
      title: String(r.title ?? ''),
      snippet: String(r.description ?? ''),
      url: String(r.url ?? ''),
    }));
    return { search_query: query, results, count: results.length };
  } catch (e: any) {
    return { search_query: query, results: [], count: 0, error: String(e) };
  }
}

export { duckDuckGoNews };

export function buildSearchQuery(question: string, context: string = ''): string {
  const bankingKeywords = ['bank', 'finance', 'market', 'economy', 'trading', 'investment'];
  const hasContext = bankingKeywords.some((kw) => question.toLowerCase().includes(kw));
  if (!hasContext && context) return `${question} ${context} banking finance trends`;
  if (!hasContext) return `${question} banking industry trends`;
  return question;
}
