import { redirect } from '@sveltejs/kit';
import { serializeOAuthState } from '@typie/ui/utils';
import qs from 'query-string';
import { env } from '$env/dynamic/public';
import type { DashboardLayout_Query_AfterLoad } from './$graphql';

export const _DashboardLayout_Query_AfterLoad: DashboardLayout_Query_AfterLoad = ({ query, event }) => {
  // Skip authentication check in development mode
  if (env.PUBLIC_ENVIRONMENT === 'local') {
    return;
  }

  if (!query.me) {
    redirect(
      302,
      qs.stringifyUrl({
        url: `${env.PUBLIC_AUTH_URL}/authorize`,
        query: {
          client_id: env.PUBLIC_OIDC_CLIENT_ID,
          response_type: 'code',
          redirect_uri: `${env.PUBLIC_WEBSITE_URL}/authorize`,
          state: serializeOAuthState({ redirect_uri: event.url.href }),
        },
      }),
    );
  }
};

export const ssr = false;
