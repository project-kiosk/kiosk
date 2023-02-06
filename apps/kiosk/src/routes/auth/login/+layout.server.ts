import { resolveUserId } from '$lib/server/auth/utilities';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = ( async ( { cookies } ) => {
  if ( resolveUserId( cookies ) ) {
    throw redirect( 307, '/' );
  }
} ) satisfies LayoutServerLoad;
