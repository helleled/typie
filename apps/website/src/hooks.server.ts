import type { Handle, HandleServerError } from '@sveltejs/kit';

const rootRedirect: Handle = async ({ event, resolve }) => {
  console.log('[rootRedirect] Called for pathname:', event.url.pathname);
  
  if (event.url.pathname === '/') {
    const target = '/website';
    console.log('[rootRedirect] Redirecting / to', target);

    return new Response(null, {
      status: 307,
      headers: {
        Location: target,
      },
    });
  }

  return resolve(event);
};

const errorHandler: HandleServerError = ({ error, status, message }) => {
  console.error('Server error:', { status, message, error });
};

export const handle = rootRedirect;
export const handleError = errorHandler;