import { resolveUserId } from '$lib/server/auth/utilities';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { Collection } from '@prisma/client';
import type { ServerLoadEvent } from '@sveltejs/kit';
import type { LayoutServerLoad } from '../$types';

export type LibraryData = { collections: Collection[] };
export const load: LayoutServerLoad<LibraryData> = async (event: ServerLoadEvent) => {
	const userId = resolveUserId(event.cookies);
	let collections: Collection[] = [];

	if (userId) {
		const caller = router.createCaller(await createContext(event));
		collections = await caller.collections.list();
	}

	return { collections };
};
