import { error, redirect } from '@sveltejs/kit';
import { cacheExchange, createClient, errorExchange, fetchExchange, GraphQLError, NetworkError, wsExchange } from '@typie/sark';
import { FormError } from '@typie/ui/form';
import ky from 'ky';
import { TypieError } from '@/errors';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

// eslint-disable-next-line import/no-default-export
export default createClient({
  url: `/graphql`,
  fetchOptions: {
    credentials: 'include',
  },
  exchanges: [
    errorExchange((error) => {
      if (error instanceof GraphQLError && error.extensions?.type === 'TypieError') {
        if (error.extensions.code === 'validation_error') {
          const extra = error.extensions.extra as { field: string; message: string }[];
          for (const { field, message } of extra) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return new FormError(field.split('.').pop()!, message);
          }
        }

        return new TypieError({
          code: error.extensions.code as string,
          message: error.message,
          status: error.extensions.status as number,
          extra: error.extensions.extra,
        });
      }

      return error;
    }),
    cacheExchange(),
    fetchExchange(),
    ...(browser
      ? [
          wsExchange(`${env.PUBLIC_WS_URL}/graphql`, {
            connectionParams: async () => {
              const resp = await ky
                .post(`/graphql`, {
                  json: {
                    operationName: 'WsExchange_CreateWsSession_Mutation',
                    query: /* GraphQL */ `
                      mutation WsExchange_CreateWsSession_Mutation {
                        createWsSession
                      }
                    `,
                  },
                })
                .json<{ data: { createWsSession: string } }>();

              return {
                session: resp.data.createWsSession,
              };
            },
          }),
        ]
      : []),
  ],
  onError: (err, event) => {
    // Skip auth redirects in development mode
    if (env.PUBLIC_ENVIRONMENT !== 'local') {
      if (err instanceof TypieError) {
        if (err.extensions?.status === 401) {
          redirect(302, `${env.PUBLIC_AUTH_URL}/login`);
        }

        error(err.status, {
          message: err.message,
          code: err.code,
        });
      }

      if (err instanceof NetworkError) {
        if (err.statusCode === 401) {
          redirect(302, event.url.href);
        }

        error(err.statusCode ?? 500, {
          message: err.message,
        });
      }
    }

    if (err instanceof GraphQLError) {
      error(500, {
        message: err.message,
        code: err.extensions?.code as string | undefined,
        eventId: err.extensions?.eventId as string | undefined,
      });
    }
  },
});
