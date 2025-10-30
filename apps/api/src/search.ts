import { sql } from 'drizzle-orm';
import { sqlite } from '@/db';

export type SearchHit = {
  id: string;
  siteId: string;
  title?: string;
  subtitle?: string;
  text?: string;
  type: 'post' | 'canvas';
  rank: number;
}

export type SearchResult = {
  totalHits: number;
  hits: SearchHit[];
}

export async function searchPosts(query: string, siteId: string): Promise<SearchHit[]> {
  if (!query.trim()) {
    return [];
  }

  const results = sqlite
    .prepare(
      `
      SELECT 
        id,
        site_id as siteId,
        title,
        subtitle,
        text,
        rank
      FROM posts_fts
      WHERE posts_fts MATCH ? AND site_id = ?
      ORDER BY rank
      LIMIT 50
    `,
    )
    .all(query.trim(), siteId) as SearchHit[];

  return results.map((hit) => ({
    ...hit,
    type: 'post' as const,
  }));
}

export async function searchCanvases(query: string, siteId: string): Promise<SearchHit[]> {
  if (!query.trim()) {
    return [];
  }

  const results = sqlite
    .prepare(
      `
      SELECT 
        id,
        site_id as siteId,
        title,
        rank
      FROM canvases_fts
      WHERE canvases_fts MATCH ? AND site_id = ?
      ORDER BY rank
      LIMIT 50
    `,
    )
    .all(query.trim(), siteId) as SearchHit[];

  return results.map((hit) => ({
    ...hit,
    type: 'canvas' as const,
  }));
}

export async function search(query: string, siteId: string): Promise<SearchResult> {
  if (!query.trim()) {
    return {
      totalHits: 0,
      hits: [],
    };
  }

  const [postHits, canvasHits] = await Promise.all([searchPosts(query, siteId), searchCanvases(query, siteId)]);

  const allHits = [...postHits, ...canvasHits].sort((a, b) => a.rank - b.rank);

  return {
    totalHits: allHits.length,
    hits: allHits,
  };
}

export function highlightText(text: string | undefined, query: string): string | undefined {
  if (!text || !query.trim()) {
    return text;
  }

  const terms = query
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 0);

  let highlighted = text;
  for (const term of terms) {
    const regex = new RegExp(`(${term})`, 'gi');
    highlighted = highlighted.replace(regex, '<em>$1</em>');
  }

  return highlighted;
}

export function indexPost(postId: string, siteId: string, title: string | null, subtitle: string | null, text: string) {
  sqlite
    .prepare(
      `
      INSERT OR REPLACE INTO posts_fts(id, site_id, title, subtitle, text)
      VALUES (?, ?, ?, ?, ?)
    `,
    )
    .run(postId, siteId, title, subtitle, text);
}

export function deletePostFromIndex(postId: string) {
  sqlite
    .prepare(
      `
      DELETE FROM posts_fts WHERE id = ?
    `,
    )
    .run(postId);
}

export function indexCanvas(canvasId: string, siteId: string, title: string | null) {
  sqlite
    .prepare(
      `
      INSERT OR REPLACE INTO canvases_fts(id, site_id, title)
      VALUES (?, ?, ?)
    `,
    )
    .run(canvasId, siteId, title);
}

export function deleteCanvasFromIndex(canvasId: string) {
  sqlite
    .prepare(
      `
      DELETE FROM canvases_fts WHERE id = ?
    `,
    )
    .run(canvasId);
}
