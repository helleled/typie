import Mixpanel from 'mixpanel-browser';
import { env } from '$env/dynamic/public';

export const setupMixpanel = () => {
  if (!env.PUBLIC_MIXPANEL_TOKEN) {
    console.log('[Analytics] Mixpanel disabled: No token provided');
    return;
  }

  try {
    Mixpanel.init(env.PUBLIC_MIXPANEL_TOKEN, {
      ignore_dnt: true,
      persistence: 'localStorage',
    });
  } catch (error) {
    console.error('[Analytics] Failed to initialize Mixpanel:', error);
  }
};

export const mixpanel = {
  identify: (id: string) => {
    try {
      if (Mixpanel && Mixpanel.persistence) {
        Mixpanel.identify(id);
      }
    } catch (error) {
      console.error('[Analytics] Failed to identify user:', error);
    }
  },
  track: (event: string, properties?: Record<string, unknown>) => {
    try {
      if (Mixpanel && Mixpanel.track) {
        Mixpanel.track(event, properties);
      }
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
    }
  },
  people: {
    set: (properties: Record<string, unknown>) => {
      try {
        if (Mixpanel && Mixpanel.people && Mixpanel.people.set) {
          Mixpanel.people.set(properties);
        }
      } catch (error) {
        console.error('[Analytics] Failed to set people properties:', error);
      }
    },
  },
};

export const fb = {
  track: (name: string, data?: Record<string, unknown>) => {
    if (typeof fbq === 'function') {
      fbq('track', name, data);
    }
  },
};
