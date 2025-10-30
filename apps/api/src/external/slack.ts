import ky from 'ky';
import { env } from '@/env';

const isConfigured = env.SLACK_WEBHOOK_URL && env.SLACK_WEBHOOK_URL !== 'http://localhost';

type SendMessageParams = { channel: string; message: string; username?: string; iconEmoji?: string };
export const sendMessage = async ({ channel, message, username, iconEmoji }: SendMessageParams) => {
  if (env.OFFLINE_MODE) {
    console.log('[Slack Offline]', JSON.stringify({ channel, message, username, iconEmoji }));
    return;
  }

  if (!isConfigured) {
    console.warn('[Slack] Webhook not configured, skipping message');
    return;
  }

  try {
    await ky.post(env.SLACK_WEBHOOK_URL, {
      json: {
        channel,
        text: message,
        username,
        icon_emoji: iconEmoji,
      },
    });
  } catch {
    // pass
  }
};
