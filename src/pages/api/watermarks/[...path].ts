import type { APIRoute } from 'astro';
import { forwardToWatermarks } from '../../../lib/watermarks';

export const prerender = false;

export const ALL: APIRoute = async ({ params, request }) => {
  const rest = params.path ?? '';
  return forwardToWatermarks(`/${rest}`, request);
};
