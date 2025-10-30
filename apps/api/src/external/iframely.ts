import ky from 'ky';
import { env } from '@/env';

const isConfigured = env.IFRAMELY_API_KEY && env.IFRAMELY_API_KEY.length > 0;

export const unfurl = async (url: string) => {
  if (env.OFFLINE_MODE) {
    throw new Error('Link embedding is unavailable in offline mode');
  }

  if (!isConfigured) {
    throw new Error('Iframely not configured');
  }

  const resp = await ky('https://iframe.ly/api/oembed', {
    searchParams: {
      api_key: env.IFRAMELY_API_KEY,
      url,
      omit_script: 1,
    },
  }).then((res) => res.json<Record<string, string>>());

  if (resp.error) {
    throw new Error(resp.error);
  }

  return {
    type: resp.type,
    title: resp.title,
    description: resp.description,
    thumbnailUrl: resp.thumbnail_url,
    html: resp.html,
  };
};
