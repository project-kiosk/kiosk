import { env } from '$env/dynamic/private';
import prisma from '$lib/prisma';
import { getSessionIdCookie, resolveUserId } from '$lib/server/auth/utilities';
import { errorResponse } from '$lib/server/utilities';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/typescript-types';
import { Buffer } from 'node:buffer';
import type { RequestHandler } from './$types';

const handler: RequestHandler = async function( { url, cookies } ): Promise<Response> {
  const sessionId: string = getSessionIdCookie( cookies ) as string;
  const userId            = resolveUserId( cookies );

  if ( !userId ) {
    return errorResponse( 401, 'Not authenticated' );
  }

  const user = await prisma.user.findFirstOrThrow( {
    where: { id: userId },
    select: {
      name: true,
      email: true,
      authenticators: true
    }
  } );

  const options = generateRegistrationOptions( {
    rpName: env.FIDO_NAME || 'Kiosk',
    rpID: url.hostname,

    userID: userId,
    userName: user.email,
    userDisplayName: user.name,

    timeout: 60_000,
    attestationType: 'none',

    /**
     * Passing in a user's list of already-registered authenticator IDs here
     * prevents users from registering the same device multiple times. The
     * authenticator will simply throw an error in the browser if it's asked to
     * perform registration when one of these ID's already resides on it.
     */
    excludeCredentials: user.authenticators.map( ( { identifier, transports } ) => ( {
      id: Buffer.from( identifier, 'base64url' ),
      type: 'public-key',
      transports: transports.split( ',' ) as AuthenticatorTransportFuture[]
    } ) ),

    /**
     * The optional authenticatorSelection property allows for specifying more
     * the types of authenticators that users to can use for registration
     */
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred'
    },

    /**
     * Support the two most common algorithms: ES256, and RS256
     */
    supportedAlgorithmIDs: [ -7, -257 ]
  } );
  const timeout = options.timeout || 60_000;

  /**
   * The server needs to temporarily remember this value for verification, so
   * don't lose it until after you verify an authenticator response.
   */
  await prisma.authenticatorChallenge.create( {
    data: {
      expiresAt: new Date( +new Date() + timeout ),
      challenge: options.challenge,
      sessionIdentifier: sessionId
    }
  } );

  return new Response( JSON.stringify( options ), {
    status: 200
  } );
};

export const GET = handler;
