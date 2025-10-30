import { z } from 'zod';

const schema = z.object({
  ANTHROPIC_API_KEY: z.string().default(''),
  API_URL: z.string().default('http://localhost:3000'),
  APPLE_APP_APPLE_ID: z.coerce.number().default(0),
  APPLE_APP_BUNDLE_ID: z.string().default(''),
  APPLE_IAP_ISSUER_ID: z.string().default(''),
  APPLE_IAP_KEY_ID: z.string().default(''),
  APPLE_IAP_PRIVATE_KEY: z.string().default(''),
  APPLE_SIGN_IN_KEY_ID: z.string().default(''),
  APPLE_SIGN_IN_PRIVATE_KEY: z.string().default(''),
  APPLE_TEAM_ID: z.string().default(''),
  AUTH_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('./data/typie.db'),
  GITHUB_TOKEN: z.string().default(''),
  GOOGLE_OAUTH_CLIENT_ID: z.string().default(''),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().default(''),
  GOOGLE_PLAY_PACKAGE_NAME: z.string().default(''),
  GOOGLE_SERVICE_ACCOUNT: z.string().default(''),
  IFRAMELY_API_KEY: z.string().default(''),
  KAKAO_CLIENT_ID: z.string().default(''),
  KAKAO_CLIENT_SECRET: z.string().default(''),
  LISTEN_PORT: z.coerce.number().optional(),
  MEILISEARCH_API_KEY: z.string().default(''),
  MEILISEARCH_URL: z.string().default('http://localhost:7700'),
  NAVER_CLIENT_ID: z.string().default(''),
  NAVER_CLIENT_SECRET: z.string().default(''),
  OIDC_CLIENT_ID: z.string().default(''),
  OIDC_CLIENT_SECRET: z.string().default(''),
  OIDC_JWK: z.string().default(''),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
  PORTONE_API_SECRET: z.string().default(''),
  PORTONE_CHANNEL_KEY: z.string().default(''),
  REDIS_URL: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SLACK_BOT_TOKEN: z.string().default(''),
  SLACK_SIGNING_SECRET: z.string().default(''),
  SLACK_WEBHOOK_URL: z.string().default('http://localhost'),
  SPELLCHECK_API_KEY: z.string().default(''),
  SPELLCHECK_URL: z.string().default('http://localhost'),
  USERSITE_URL: z.string().default('http://localhost:5173'),
  WEBSITE_URL: z.string().default('http://localhost:5173'),
});

export const env = schema.parse(process.env.ENV_JSON ? JSON.parse(process.env.ENV_JSON) : process.env);
export const stack = process.env.PUBLIC_ENVIRONMENT ?? process.env.DOPPLER_ENVIRONMENT ?? 'local';
export const dev = process.env.NODE_ENV !== 'production';
export const production = stack === 'prod';
