import { redirect } from '@sveltejs/kit';
import { serializeOAuthState } from '@typie/ui/utils';
import qs from 'query-string';
import { env } from '$env/dynamic/public';
import type { UsersiteApexPermalinkPage_Query_AfterLoad, UsersiteApexPermalinkPage_Query_Variables } from './$graphql';

export const _UsersiteApexPermalinkPage_Query_Variables: UsersiteApexPermalinkPage_Query_Variables = ({ params }) => ({
  permalink: params.permalink,
});

export const _UsersiteApexPermalinkPage_Query_AfterLoad: UsersiteApexPermalinkPage_Query_AfterLoad = ({ query }) => {
  // Skip auth redirect in development mode
  if (env.PUBLIC_ENVIRONMENT === 'local') {
    return;
  }

  const authorizeUrl = qs.stringifyUrl({
    url: `${env.PUBLIC_AUTH_URL}/authorize`,
    query: {
      client_id: env.PUBLIC_OIDC_CLIENT_ID,
      response_type: 'code',
      redirect_uri: `${query.permalink.siteUrl}/authorize`,
      state: serializeOAuthState({ redirect_uri: `${query.permalink.siteUrl}/${query.permalink.entitySlug}` }),
      prompt: 'none',
    },
  });

  redirect(302, authorizeUrl);
};
