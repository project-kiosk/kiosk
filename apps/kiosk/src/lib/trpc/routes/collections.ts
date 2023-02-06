import prisma from '$lib/prisma';
import { auth } from '$lib/trpc/middleware/auth';
import { logger } from '$lib/trpc/middleware/logger';
import { t } from '$lib/trpc/t';
import type { Collection } from '@prisma/client';
import { z } from 'zod';

export const collections = t.router( {
  list: t.procedure
         .meta( { guarded: true } )
         .use( logger )
         .use( auth ) // 👈 use auth middleware
         .input(
           z
           .object( {
             book: z.string().optional()
           } )
           .optional()
         )
         .query( ( { input, ctx } ) => loadCollections( ctx.userId, input ) ),

  load: t.procedure
         .meta( { guarded: true } )
         .use( logger )
         .use( auth ) // 👈 use auth middleware
         .input( z.string() )
         .query( ( { input, ctx } ) => loadCollection( input, ctx.userId ) ),

  toggleBook: t.procedure
               .meta( { guarded: true } )
               .use( logger )
               .use( auth ) // 👈 use auth middleware
               .input(
                 z.object( {
                   collection: z.string(),
                   book: z.string()
                 } )
               )
               .mutation( async ( { input: { book, collection }, ctx } ) => {
                 await prisma.$transaction( async ( tx ) => {
                   const existsInCollection =
                           0 ===
                           ( await tx.collection.count( {
                             where: {
                               id: collection,
                               books: {
                                 some: {
                                   id: book
                                 }
                               }
                             }
                           } ) );

                   await tx.collection.update( {
                     where: { id: collection },
                     data: {
                       books: {
                         [ existsInCollection ? 'connect' : 'disconnect' ]: {
                           id: book
                         }
                       }
                     }
                   } );
                 } );
               } ),

  save: t.procedure
         .meta( { guarded: true } )
         .use( logger )
         .use( auth ) // 👈 use auth middleware
         .input(
           z.object( {
             id: z.string().nullable().optional(),
             name: z.string().optional(),
             icon: z.string().optional()
           } )
         )
         .mutation( async ( { input: { id, ...rest }, ctx: { userId } } ) => {
           if ( id ) {
             await prisma.collection.update( {
               data: {
                 ...rest,
                 ownerId: userId
               },
               where: { id }
             } );
           } else {
             if ( !rest.name ) {
               throw new Error( 'No collection name provided' );
             }

             await prisma.collection.create( {
               data: {
                 ...rest,
                 ownerId: userId,
                 name: rest.name
               }
             } );
           }
         } )
} );

async function loadCollections( userId: string, query?: { book?: string } ): Promise<Collection[]> {
  /*
   if ( query?.book ) {
   return prisma.collection.findMany( {
   where: {
   owner: { id: userId },
   books: {
   }
   }
   } );
   }
   */
  return prisma.collection.findMany( {
    where: { owner: { id: userId } },
    include: {
      _count: true
    }
  } );
}

async function loadCollection( id: string, ownerId: string ): Promise<Collection> {
  return prisma.collection.findFirstOrThrow( {
    where: { id, ownerId },
    include: {
      books: {
        include: {
          author: true
        }
      },
    }
  } );
}
