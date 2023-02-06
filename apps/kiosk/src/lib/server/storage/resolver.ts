import type { Asset, Book, Cover } from '@prisma/client';

type BookWithNested<T> = Book & T;
type BookWithCover = BookWithNested<{ cover: Cover | null }>;
type BookWithExistingCover = BookWithNested<{ cover: Cover }>;
type BookWithMissingCover = BookWithNested<{ cover: null }>;

export function resolveBookPath(book: Book): string {
	return `books/${book.id}`;
}

export function resolveCoverPath(book: Book, cover: null): undefined;
export function resolveCoverPath(book: Book, cover: Cover): string;
export function resolveCoverPath(book: BookWithExistingCover): string;
export function resolveCoverPath(book: BookWithMissingCover): undefined;
export function resolveCoverPath(book: BookWithCover): string | undefined;
export function resolveCoverPath(
	book: Book | BookWithCover,
	cover?: Cover | null
): string | undefined {
	const _cover: Cover | null = ('cover' in book ? book.cover : cover) || null;

	if (!_cover) {
		return undefined;
	}

	return `${resolveBookPath(book)}/cover-${_cover.id}`;
}

export function resolveAssetPath(book: Book, asset: Asset): string {
	return `${resolveBookPath(book)}/asset-${asset.id}`;
}
