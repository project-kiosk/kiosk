import prisma from '$lib/prisma';
import { auth } from '$lib/trpc/middleware/auth';
import { logger } from '$lib/trpc/middleware/logger';
import { t } from '$lib/trpc/t';
import { z } from 'zod';

export const users = t.router( {
  load: t.procedure
         .meta( { guarded: true } )
         .use( logger )
         .use( auth )
         .input( z.string() )
         .query( ( { input } ) =>
           prisma.user.findFirstOrThrow( {
             where: { id: input }
           } )
         ),

  current: t.procedure
            .meta( { guarded: true } )
            .use( logger )
            .use( auth )
            .query( ( { ctx } ) =>
              prisma.user.findFirstOrThrow( {
                where: { id: ctx.userId },
                include: {
                  authenticators: true
                }
              } )
            ),

  updateCurrent: t.procedure
                  .meta( { guarded: true } )
                  .use( logger )
                  .use( auth )
                  .input(
                    z.object( {
                      name: z.string()
                    } )
                  )
                  .mutation( async ( { input, ctx } ) =>
                    prisma.user.update( {
                      where: {
                        id: ctx.userId
                      },
                      data: {
                        name: input.name
                      }
                    } )
                  ),

  removeAuthenticator: t.procedure
                        .meta( { guarded: true } )
                        .use( logger )
                        .use( auth )
                        .input( z.string() )
                        .mutation( async ( { input, ctx } ) =>
                          prisma.authenticator.deleteMany( {
                            where: {
                              id: input,
                              user: {
                                id: ctx.userId
                              }
                            }
                          } )
                        )
} );
