import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ( event ) => {
  const caller = router.createCaller( await createContext( event ) );

  try {
    const user = await caller.users.current();

    return { user };
  } catch {
    throw error( 404, 'User not found' );
  }
};
