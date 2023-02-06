import { accounts } from '$lib/trpc/routes/acounts';
import { authors } from '$lib/trpc/routes/authors';
import { books } from '$lib/trpc/routes/books';
import { collections } from '$lib/trpc/routes/collections';
import { publishers } from '$lib/trpc/routes/publishers';
import { users } from '$lib/trpc/routes/users';
import { t } from '$lib/trpc/t';
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export const router = t.router( {
  accounts,
  authors,
  books,
  collections,
  publishers,
  users
} );

export type Router = typeof router;

// 👇 type helpers 💡
export type RouterInputs = inferRouterInputs<Router>;
export type RouterOutputs = inferRouterOutputs<Router>;
