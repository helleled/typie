import { clearAllDataLoaders } from '@pothos/plugin-dataloader';
import { getClientAddress } from '@typie/lib';
import DataLoader from 'dataloader';
import { and, eq } from 'drizzle-orm';
import stringify from 'fast-json-stable-stringify';
import { HTTPException } from 'hono/http-exception';
import * as jose from 'jose';
import { nanoid } from 'nanoid';
import * as R from 'remeda';
import { redis } from '@/cache';
import { db, first, firstOrThrow, Users, UserSessions } from '@/db';
import { dev } from '@/env';
import { publicKey } from '@/utils';
import { UserState, UserRole } from '@/enums';
import type { Context as HonoContext } from 'hono';

type LoaderParams<Key, Result, SortKey, Nullability extends boolean, Many extends boolean> = {
  name: string;
  nullable?: Nullability;
  many?: Many;
  key: (value: Nullability extends true ? Result | null : Result) => Nullability extends true ? SortKey | null : SortKey;
  load: (keys: Key[]) => Promise<Result[]>;
};

export type ServerContext = HonoContext<Env>;

type DefaultContext = {
  ip: string;
  deviceId: string;

  loader: <
    Key = string,
    Result = unknown,
    SortKey = Key,
    Nullability extends boolean = false,
    Many extends boolean = false,
    MaybeResult = Nullability extends true ? Result | null : Result,
    FinalResult = Many extends true ? MaybeResult[] : MaybeResult,
  >(
    params: LoaderParams<Key, Result, SortKey, Nullability, Many>,
  ) => DataLoader<Key, FinalResult, string>;
  ' $loaders': Map<string, DataLoader<unknown, unknown>>;
};

export type SessionContext = {
  session: {
    id: string;
    userId: string;
  };
};

export type Context = DefaultContext & Partial<SessionContext>;

export type UserContext = Context & {
  c: ServerContext;
};

export type Env = {
  Variables: { context: Context };
};

export const deriveContext = async (c: ServerContext): Promise<Context> => {
  let deviceId = c.req.header('X-Device-Id');
  if (!deviceId) {
    deviceId = nanoid(32);
  }

  const ctx: Context = {
    ip: getClientAddress(c),
    deviceId,
    loader: ({ name, nullable, many, load, key }) => {
      const cached = ctx[' $loaders'].get(name);
      if (cached) {
        return cached as never;
      }

      const loader = new DataLoader(
        async (keys) => {
          const rows = await load(keys as never);
          const values = R.groupBy(rows, (row) => stringify(key(row)));
          return keys.map((key) => {
            const value = values[stringify(key)];

            if (value?.length) {
              return many ? value : value[0];
            }

            if (nullable) {
              return null;
            }

            if (many) {
              return [];
            }

            return new Error(`DataLoader(${name}): Missing key`);
          });
        },
        { cacheKeyFn: (key) => stringify(key) },
      );

      ctx[' $loaders'].set(name, loader);

      return loader as never;
    },
    ' $loaders': new Map(),
  };

  // Local-only mode: always use default local user
  const localUser = await db
    .select({ id: Users.id })
    .from(Users)
    .where(sql`${Users.email} = 'local@typie.app'`)
    .then(first);

  if (localUser) {
    ctx.session = {
      id: 'local-session',
      userId: localUser.id,
    };
  } else {
    // If no local user exists, create one
    const defaultLocalUser = await db.insert(Users).values({
      email: 'local@typie.app',
      name: 'Local User',
      state: UserState.ACTIVE,
      role: UserRole.USER,
    }).returning({ id: Users.id }).then(firstOrThrow);
    
    ctx.session = {
      id: 'local-session',
      userId: defaultLocalUser.id,
    };
  }

  return ctx;
};

export const clearLoaders = (ctx: Context) => {
  for (const loader of ctx[' $loaders'].values()) {
    loader.clearAll();
  }

  clearAllDataLoaders(ctx);
};
