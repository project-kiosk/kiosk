import { query } from '$lib/knowledge-graph/knowledgeGraph';
import prisma from '$lib/prisma';
import { auth } from '$lib/trpc/middleware/auth';
import { logger } from '$lib/trpc/middleware/logger';
import { t } from '$lib/trpc/t';
import { z } from 'zod';

export const publishers = t.router( {
	list: t.procedure
				 .meta( { guarded: true } )
				 .use( logger )
				 .input( z.string().optional() )
				 .query( ( { input } ) =>
					 prisma.publisher.findMany( {
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

	load: t.procedure
				 .meta( { guarded: true } )
				 .use( logger )
				 .use( auth ) // 👈 use auth middleware
				 .input( z.string() )
				 .query( ( { input } ) =>
					 prisma.publisher.findUniqueOrThrow( {
						 where: { id: input },
						 include: {
							 books: {
								 include: {
									 author: true
								 }
							 }
						 }
					 } )
				 ),

	save: t.procedure
				 .meta( { guarded: true } )
				 .use( logger )
				 .use( auth ) // 👈 use auth middleware
				 .input(
					 z.object( {
						 id: z.string(),
						 name: z.string().min( 3 ).max( 50 ).optional(),
						 description: z.string().optional(),
						 wikipediaUrl: z.string().optional(),
						 logoUrl: z.string().optional()
					 } )
				 )
				 .mutation( ( { input: { id, ...rest }, ctx: { userId } } ) => {
					 if ( id ) {
						 return prisma.publisher.update( {
							 data: { ...rest, updatedByUserId: userId },
							 where: { id }
						 } );
					 }

					 return prisma.publisher.create( {
						 data: { ...rest, name: rest.name || 'Unknown Publisher', updatedByUserId: userId }
					 } );
				 } ),

	fetchInfo: t.procedure
							.use( logger )
							.use( auth ) // 👈 use auth middleware
							.input( z.string() )
							.query( ( { input, ctx: { platform } } ) => query( platform, input, [ 'Organization' ] ) ),

	autocomplete: t.procedure
								 .meta( { guarded: true } )
								 .use( logger )
								 .use( auth )
								 .input( z.string() )
								 .query( ( { input } ) =>
									 prisma.publisher.findMany( {
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
								 )
} );
