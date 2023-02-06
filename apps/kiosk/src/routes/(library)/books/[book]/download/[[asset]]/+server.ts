import prisma from '$lib/prisma';
import { resolveAssetPath } from '$lib/server/storage/resolver';
import { readFile } from '$lib/server/storage/storage';
import { errorResponse } from '$lib/server/utilities';
import type { RequestHandler } from '@sveltejs/kit';
import { error, redirect } from '@sveltejs/kit';

const handler: RequestHandler = async function( {
                                                  params,
                                                  request,
                                                  url,
                                                  platform
                                                } ): Promise<Response> {
  const book = await prisma.book.findFirstOrThrow( {
    where: { id: params.book },
    include: { assets: true }
  } );

  if ( book.assets.length === 0 ) {
    throw error( 404 );
  }

  const asset = params.asset
                ? book.assets.find( ( asset ) => asset.id === params.asset )
                : book.assets.at( 0 );

  if ( !asset ) {
    return errorResponse( 404, 'Failed to locate asset' );
  }

  if ( request.headers.has( 'if-modified-since' ) ) {
    const timestamp = new Date( request.headers.get( 'if-modified-since' ) as string );

    if ( asset.updatedAt <= timestamp ) {
      throw redirect( 304, url.toString() );
    }
  }

  const path = resolveAssetPath( book, asset );

  return new Response( await readFile( platform, path ), {
    status: 200,
    headers: {
      'Content-Type': asset.mediaType as string,
      'Last-Modified': asset.updatedAt.toUTCString() as string
    }
  } );
};

// noinspection JSUnusedGlobalSymbols
export const GET = handler;
