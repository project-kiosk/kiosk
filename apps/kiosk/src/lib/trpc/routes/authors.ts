import { query } from '$lib/knowledge-graph/knowledgeGraph';
import prisma from '$lib/prisma';
import { auth } from '$lib/trpc/middleware/auth';
import { logger } from '$lib/trpc/middleware/logger';
import { t } from '$lib/trpc/t';
import { z } from 'zod';

export const authors = t.router( {
  autocomplete: t.procedure
                 .use( logger )
                 .input( z.string() )
                 .query( ( { input } ) =>
                   prisma.author.findMany( {
                     select: {
                       id: true,
                       name: true
                     },
                     orderBy: { name: 'desc' },
                     where: {
                       name: {
                         contains: input
                       }
                     }
                   } )
                 ),

  list: t.procedure
         .use( logger )
         .input( z.string().optional() )
         .query( ( { input } ) =>
           prisma.author.findMany( {
             select: {
               id: true,
               name: true,
               updatedAt: true,
               _count: { select: { books: true } }
             },
             orderBy: { updatedAt: 'desc' },
             where: input ? { name: { contains: input } } : undefined
           } )
         ),

  loadOptions: t.procedure.use( logger ).query( () =>
    prisma.author
          .findMany( {
            select: { id: true, name: true },
            orderBy: [ { name: 'asc' } ]
          } )
          .then( ( authors ) =>
            authors.map( ( { id, name } ) => ( {
              label: name,
              value: id
            } ) )
          )
  ),

  load: t.procedure
         .use( logger )
         .use( auth ) // 👈 use auth middleware
         .input( z.string() )
         .query( ( { input } ) =>
           prisma.author.findUniqueOrThrow( {
             where: { id: input },
             include: {
               books: true
             }
           } )
         ),

  fetchInfo: t.procedure
              .use( logger )
              .use( auth ) // 👈 use auth middleware
              .input( z.string() )
              .query( ( { input, ctx: { platform } } ) => query( platform, input, [ 'Person' ] ) ),

  update: t.procedure
           .meta( { guarded: true } )
           .use( logger )
           .use( auth ) // 👈 use auth middleware
           .input(
             z.object( {
               id: z.string(),
               name: z.string().min( 3 ).max( 50 ).optional(),
               description: z.string().optional(),
               wikipediaUrl: z.string().optional(),
               pictureUrl: z.string().optional()
             } )
           )
           .mutation( async ( { input: { id, ...rest }, ctx: { userId } } ) => {
             console.log( {
               data: { ...rest, updatedByUserId: userId },
               where: { id }
             } );
             await prisma.author.update( {
               data: { ...rest, updatedByUserId: userId },
               where: { id }
             } );
           } ),

  save: t.procedure
         .meta( { guarded: true } )
         .use( logger )
         .use( auth ) // 👈 use auth middleware
         .input(
           z.object( {
             id: z.string().nullable(),
             name: z.string().min( 3 ).max( 50 ),
             description: z.string().nullable()
           } )
         )
         .mutation( async ( { input: { id, ...rest }, ctx: { userId } } ) => {
           if ( id ) {
             await prisma.author.update( {
               data: { ...rest, updatedByUserId: userId },
               where: { id }
             } );
           } else {
             await prisma.author.create( {
               data: { ...rest, updatedByUserId: userId }
             } );
           }
         } ),

  delete: t.procedure
           .meta( { guarded: true } )
           .use( logger )
           .use( auth ) // 👈 use auth middleware
           .input( z.string() )
           .mutation( async ( { input: id } ) => {
             await prisma.author.delete( { where: { id } } );
           } )
} );
