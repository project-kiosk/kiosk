import { env } from '$env/dynamic/private';
import { index } from '$lib/server/search/search';
import type { Book } from '@prisma/client';

type BookWithIncludes = Book & {
	author: { name: string } | null;
	publisher: { name: string } | null;
};

export async function indexBook(book: BookWithIncludes, url: URL) {
	await index(env.SEARCH_INDEX_BOOKS || 'books', {
		...book,
		author: book.author?.name,
		publisher: book.publisher?.name,
		cover: new URL(`/books/${book.id}/cover`, url)
	});
}
