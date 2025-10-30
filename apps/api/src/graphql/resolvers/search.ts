import { match } from 'ts-pattern';
import { TableCode, validateDbId } from '@/db';
import { SearchHitType } from '@/enums';
import { search, highlightText } from '@/search';
import { assertSitePermission } from '@/utils/permission';
import { builder } from '../builder';
import { Canvas, Post } from '../objects';

builder.queryFields((t) => ({
  search: t.withAuth({ session: true }).field({
    type: builder.simpleObject('SearchResult', {
      fields: (t) => ({
        totalHits: t.int(),
        hits: t.field({
          type: [
            builder.unionType('SearchHit', {
              types: [
                builder.simpleObject('SearchHitPost', {
                  fields: (t) => ({
                    type: t.field({ type: SearchHitType }),
                    title: t.string({ nullable: true }),
                    subtitle: t.string({ nullable: true }),
                    text: t.string({ nullable: true }),
                    post: t.field({ type: Post }),
                  }),
                }),
                builder.simpleObject('SearchHitCanvas', {
                  fields: (t) => ({
                    type: t.field({ type: SearchHitType }),
                    title: t.string({ nullable: true }),
                    canvas: t.field({ type: Canvas }),
                  }),
                }),
              ],
              resolveType: (self) =>
                match(self.type)
                  .with(SearchHitType.POST, () => 'SearchHitPost')
                  .with(SearchHitType.CANVAS, () => 'SearchHitCanvas')
                  .exhaustive(),
            }),
          ],
        }),
      }),
    }),
    args: {
      siteId: t.arg.id({ validate: validateDbId(TableCode.SITES) }),
      query: t.arg.string(),
    },
    resolve: async (_, args, ctx) => {
      await assertSitePermission({
        userId: ctx.session.userId,
        siteId: args.siteId,
      });

      if (!args.query.trim()) {
        return {
          totalHits: 0,
          hits: [],
        };
      }

      const result = await search(args.query, args.siteId);

      return {
        totalHits: result.totalHits,
        hits: result.hits.map((hit) =>
          match(hit.type)
            .with('post', () => ({
              type: SearchHitType.POST,
              title: highlightText(hit.title, args.query),
              subtitle: highlightText(hit.subtitle, args.query),
              text: highlightText(hit.text, args.query),
              post: hit.id,
            }))
            .with('canvas', () => ({
              type: SearchHitType.CANVAS,
              title: highlightText(hit.title, args.query),
              canvas: hit.id,
            }))
            .exhaustive(),
        ),
      };
    },
  }),
}));
