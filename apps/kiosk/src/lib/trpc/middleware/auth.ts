import { t } from '$lib/trpc/t';
import { TRPCError } from '@trpc/server';

export const auth = t.middleware( async ( { next, ctx, meta } ) => {
  if ( !meta?.guarded ) {
    return next();
  }

  if ( !ctx.userId ) {
    throw new TRPCError( {
      code: 'UNAUTHORIZED'
    } );
  }

  return next();
} );
