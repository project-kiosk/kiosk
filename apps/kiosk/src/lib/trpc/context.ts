import { resolveUserId } from '$lib/server/auth/utilities';
import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';

export async function createContext( event: RequestEvent ) {
  const userId   = resolveUserId( event.cookies ) || '';
  const url      = event.url;
  const platform = event.platform;

  return { userId, url, platform };
}

export type Context = inferAsyncReturnType<typeof createContext>;
