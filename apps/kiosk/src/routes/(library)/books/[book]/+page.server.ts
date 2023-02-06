import type { Alpha2Code } from '$lib/language';
import { getLanguageByAlpha2Code } from '$lib/language';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ( event ) => {
  const caller       = router.createCaller( await createContext( event ) );
  const { book: id } = event.params;

  try {
    const book     = await caller.books.load( id );
    const language = book.language ? getLanguageByAlpha2Code( book.language as Alpha2Code ) : null;

    return { book, language };
  } catch {
    throw error( 404, 'Book not found' );
  }
};
