import prisma from '$lib/prisma';
import { errorResponse } from '$lib/server/utilities';
import type { RequestHandler } from '@sveltejs/kit';

const handler: RequestHandler = async function( { params } ): Promise<Response> {
  const author = await prisma.author.findFirstOrThrow( {
    where: { id: params.author },
    select: { pictureUrl: true }
  } );

  if ( author.pictureUrl === null ) {
    return errorResponse( 404, 'No picture available' );
  }

  return Response.redirect( author.pictureUrl, 307 );
};

export const GET = handler;
