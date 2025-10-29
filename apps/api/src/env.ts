import { z } from 'zod';

const schema = z.object({
  ANTHROPIC_API_KEY: z.string().default(''),
  APPLE_APP_APPLE_ID: z.coerce.number().default(0),
  APPLE_APP_BUNDLE_ID: z.string().default(''),
  APPLE_IAP_ISSUER_ID: z.string().default(''),
  APPLE_IAP_KEY_ID: z.string().default(''),
  APPLE_IAP_PRIVATE_KEY: z.string().default(''),
  APPLE_SIGN_IN_KEY_ID: z.string().default(''),
  APPLE_SIGN_IN_PRIVATE_KEY: z.string().default(''),
  APPLE_TEAM_ID: z.string().default(''),
  AUTH_URL: z.string().default('http://localhost:4100'),
  DATABASE_URL: z.string(),
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
  OIDC_JWK: z
    .string()
    .default(
      'eyJjcnYiOiJQLTI1NiIsImQiOiJrZ0o3OGRvanFSZXVNZmp3RW9BQ2pIUWpCTFlxM0FnZ0htLVFZOTNNUE9nIiwia3R5IjoiRUMiLCJ4IjoicGlYR1BNdS1XQU56U1dhSTl1VWZQNENZSFpKY2RpS0xCZGRaNWJmS19JNCIsInkiOiJsVXA2Y2E0T3d1MXoxZHFvNUpmZFpHcFcxd0ZKWEZJT2NNLXhFRnNnOW9BIiwia2lkIjoiZHVtbXkiLCJhbGciOiJFUzI1NiJ9',
    ),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
  PORTONE_API_SECRET: z.string().default(''),
  PORTONE_CHANNEL_KEY: z.string().default(''),
  REDIS_URL: z.string(),
  SENTRY_DSN: z.string().optional(),
  SLACK_BOT_TOKEN: z.string().default(''),
  SLACK_SIGNING_SECRET: z.string().default(''),
  SLACK_WEBHOOK_URL: z.string().default('http://localhost'),
  SPELLCHECK_API_KEY: z.string().default(''),
  SPELLCHECK_URL: z.string().default('http://localhost'),
  USERSITE_URL: z.string().default('http://localhost:4000'),
  WEBSITE_URL: z.string().default('http://localhost:4000'),
});

export const env = schema.parse(process.env.ENV_JSON ? JSON.parse(process.env.ENV_JSON) : process.env);
export const stack = process.env.PUBLIC_ENVIRONMENT ?? process.env.DOPPLER_ENVIRONMENT ?? 'local';
export const dev = process.env.NODE_ENV !== 'production';
export const production = stack === 'prod';
