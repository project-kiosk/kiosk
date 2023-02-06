import { resolveUserId } from '$lib/server/auth/utilities';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { createTRPCHandle } from 'trpc-sveltekit';

const trpcHandle: Handle = createTRPCHandle({
	router,
	createContext,
	onError: ({ type, path, error }) =>
		console.error(`Encountered error while trying to process ${type} @ ${path}:`, error)
});

const authHandle: Handle = function ({ event, resolve }) {
	event.locals.userId = resolveUserId(event.cookies);

	return resolve(event);
};

export const handle = sequence(trpcHandle, authHandle);
