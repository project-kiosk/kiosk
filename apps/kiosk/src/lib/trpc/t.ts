import type { Context } from '$lib/trpc/context';
import { initTRPC } from '@trpc/server';

interface Meta {
	guarded: boolean;
}

export const t = initTRPC.context<Context>().meta<Meta>().create({});
