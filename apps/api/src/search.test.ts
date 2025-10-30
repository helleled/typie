import { afterAll,beforeAll, describe, expect, test } from 'bun:test';
import { db, sqlite } from '@/db';
import { deleteCanvasFromIndex, deletePostFromIndex, indexCanvas, indexPost, search } from '@/search';

describe('SQLite FTS Search', () => {
  const testSiteId = 'test-site-id';
  const testPostId = 'test-post-id';
  const testCanvasId = 'test-canvas-id';

  beforeAll(() => {
    sqlite.exec('DELETE FROM posts_fts');
    sqlite.exec('DELETE FROM canvases_fts');
  });

  afterAll(() => {
    sqlite.exec('DELETE FROM posts_fts');
    sqlite.exec('DELETE FROM canvases_fts');
  });

  describe('Post indexing', () => {
    test('should index a post', () => {
      indexPost(testPostId, testSiteId, 'Test Title', 'Test Subtitle', 'This is test content');

      const result = sqlite
        .prepare('SELECT * FROM posts_fts WHERE id = ?')
        .get(testPostId) as any;

      expect(result).toBeDefined();
      expect(result.id).toBe(testPostId);
      expect(result.site_id).toBe(testSiteId);
      expect(result.title).toBe('Test Title');
      expect(result.subtitle).toBe('Test Subtitle');
      expect(result.text).toBe('This is test content');
    });

    test('should delete a post from index', () => {
      indexPost(testPostId + '-delete', testSiteId, 'Delete Test', null, 'Content');
      deletePostFromIndex(testPostId + '-delete');

      const result = sqlite
        .prepare('SELECT * FROM posts_fts WHERE id = ?')
        .get(testPostId + '-delete');

      expect(result).toBeUndefined();
    });
  });

  describe('Canvas indexing', () => {
    test('should index a canvas', () => {
      indexCanvas(testCanvasId, testSiteId, 'Test Canvas Title');

      const result = sqlite
        .prepare('SELECT * FROM canvases_fts WHERE id = ?')
        .get(testCanvasId) as any;

      expect(result).toBeDefined();
      expect(result.id).toBe(testCanvasId);
      expect(result.site_id).toBe(testSiteId);
      expect(result.title).toBe('Test Canvas Title');
    });

    test('should delete a canvas from index', () => {
      indexCanvas(testCanvasId + '-delete', testSiteId, 'Delete Canvas Test');
      deleteCanvasFromIndex(testCanvasId + '-delete');

      const result = sqlite
        .prepare('SELECT * FROM canvases_fts WHERE id = ?')
        .get(testCanvasId + '-delete');

      expect(result).toBeUndefined();
    });
  });

  describe('Search functionality', () => {
    beforeAll(() => {
      indexPost('post-1', testSiteId, 'JavaScript Tutorial', 'Learn JavaScript', 'This is a comprehensive JavaScript tutorial');
      indexPost('post-2', testSiteId, 'TypeScript Guide', 'TypeScript Basics', 'TypeScript is a superset of JavaScript');
      indexCanvas('canvas-1', testSiteId, 'Design Mockup');
      indexCanvas('canvas-2', testSiteId, 'JavaScript Flowchart');
    });

    test('should search posts', async () => {
      const result = await search('JavaScript', testSiteId);

      expect(result.totalHits).toBeGreaterThan(0);
      expect(result.hits.some((hit) => hit.type === 'post')).toBe(true);
    });

    test('should search canvases', async () => {
      const result = await search('Design', testSiteId);

      expect(result.totalHits).toBeGreaterThan(0);
      expect(result.hits.some((hit) => hit.type === 'canvas')).toBe(true);
    });

    test('should search across posts and canvases', async () => {
      const result = await search('JavaScript', testSiteId);

      expect(result.totalHits).toBeGreaterThan(0);
      const hasPost = result.hits.some((hit) => hit.type === 'post');
      const hasCanvas = result.hits.some((hit) => hit.type === 'canvas');

      expect(hasPost || hasCanvas).toBe(true);
    });

    test('should return empty results for non-existent terms', async () => {
      const result = await search('xyznonexistent', testSiteId);

      expect(result.totalHits).toBe(0);
      expect(result.hits).toHaveLength(0);
    });

    test('should only return results for the specified site', async () => {
      const otherSiteId = 'other-site-id';
      indexPost('post-other', otherSiteId, 'Other Site Post', null, 'Content for other site');

      const result = await search('Other', testSiteId);

      expect(result.hits.every((hit) => hit.siteId === testSiteId)).toBe(true);
    });
  });
});
