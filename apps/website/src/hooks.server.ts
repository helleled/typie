import type { HandleServerError } from '@sveltejs/kit';

const errorHandler: HandleServerError = ({ error, status, message }) => {
  console.error('Server error:', { status, message, error });
};

export const handleError = errorHandler;
