import prisma from '$lib/prisma';
import { resolveCoverPath } from '$lib/server/storage/resolver';
import { readFile } from '$lib/server/storage/storage';
import { errorResponse } from '$lib/server/utilities';
import type { RequestHandler } from '@sveltejs/kit';

const handler: RequestHandler = async function( {
                                                  params,
                                                  request,
                                                  url,
                                                  platform
                                                } ): Promise<Response> {
  const book = await prisma.book.findFirstOrThrow( {
    where: { id: params.book },
    include: { cover: true }
  } );

  if ( book.cover === null ) {
    return errorResponse( 404, 'No cover available' );
  }

  if ( request.headers.has( 'if-modified-since' ) ) {
    const timestamp = new Date( request.headers.get( 'if-modified-since' ) as string );

    if ( book.cover.updatedAt <= timestamp ) {
      return Response.redirect( url.toString(), 304 );
    }
  }

  const coverPath = resolveCoverPath( book, book.cover );

  return new Response( await readFile( platform, coverPath ), {
    status: 200,
    headers: {
      'Content-Type': book.cover?.mediaType as string,
      'Last-Modified': book.cover?.updatedAt.toUTCString() as string
    }
  } );
};

export const GET = handler;
