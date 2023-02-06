import prisma from '$lib/prisma';
import { indexBook } from "$lib/server/search/utilities";
import { auth } from '$lib/trpc/middleware/auth';
import { logger } from '$lib/trpc/middleware/logger';
import { t } from '$lib/trpc/t';
import type { Asset, Author, Book, User } from '@prisma/client';
import { z } from 'zod';

export const books = t.router( {
  list: t.procedure
         .use( logger )
         .input( z.string().optional() )
         .query( ( { input } ) => loadBooks( input ) ),

  load: t.procedure
         .use( logger )
         .use( auth ) // 👈 use auth middleware
         .input( z.string() )
         .query( ( { input } ) => loadBook( input ) ),

  save: t.procedure
         .meta( { guarded: true } )
         .use( logger )
         .use( auth ) // 👈 use auth middleware
         .input(
           z.object( {
             id: z.string().nullable().optional(),
             title: z.string().optional(),
             rating: z.number( { coerce: true } ).optional(),
             description: z.string().nullable().optional()
           } )
         )
         .mutation( async ( { input: { id, ...rest }, ctx: { userId, url } } ) => {
           if ( !id ) {
             throw new Error( 'Books must not be created via the JSON API' );
           }

           const book = await prisma.book.update( {
             data: {
               ...rest,
               updatedByUserId: userId
             },
             where: { id },
             include: {
               author: { select: { name: true } },
               publisher: { select: { name: true } }
             }
           } );

            await indexBook( book, url );
         } ),

  delete: t.procedure
           .meta( { guarded: true } )
           .use( logger )
           .use( auth ) // 👈 use auth middleware
           .input( z.string() )
           .mutation( async ( { input: id } ) => {
             await prisma.book.delete( { where: { id } } );
           } )
} );

function loadBooks( query: string | undefined ) {
  return prisma.book.findMany( {
    select: {
      id: true,
      title: true,
      updatedAt: true,
      author: { select: { name: true } },
      _count: { select: { assets: true } }
    },
    orderBy: { updatedAt: "desc" },
    where: query
           ? {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { author: { name: { contains: query } } }
        ]
      }
           : undefined
  } );
}

async function loadBook(
  id: string
): Promise<Book & { assets: Asset[]; updatedBy: User | null; author: Author | null }> {
  return prisma.book.findFirstOrThrow( {
    where: { id },
    include: {
      author: true,
      cover: true,
      publisher: true,
      updatedBy: true,
      assets: true
    }
  } );
}
