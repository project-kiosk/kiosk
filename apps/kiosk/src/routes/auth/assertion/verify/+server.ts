import prisma from '$lib/prisma';
import {
  cleanChallenges,
  getSessionIdCookie,
  issueAccessToken,
  resolveCurrentChallenge,
  setJwtCookie
} from '$lib/server/auth/utilities';
import { errorResponse, jsonResponse } from '$lib/server/utilities';
import type { VerifiedAuthenticationResponse } from '@simplewebauthn/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import type {
  AuthenticationCredentialJSON,
  AuthenticatorTransportFuture
} from '@simplewebauthn/typescript-types';
import type { RequestHandler } from '@sveltejs/kit';
import { Buffer } from 'node:buffer';

const handler: RequestHandler = async function( { url, request, cookies } ): Promise<Response> {
  const sessionId: string = getSessionIdCookie( cookies ) as string;
  let challenge: string;

  try {
    challenge = await resolveCurrentChallenge( sessionId );
  } catch ( error ) {
    const { message } = error as Error;

    return errorResponse( 400, message );
  }

  let parsedBody: AuthenticationCredentialJSON;

  try {
    parsedBody = await request.json();
  } catch ( error ) {
    const { message } = error as Error;

    await cleanChallenges( sessionId );

    return errorResponse( 400, `Invalid request body: ${ message }` );
  }

  const userId = parsedBody.response.userHandle;

  if ( !userId ) {
    await cleanChallenges( sessionId );

    return errorResponse( 400, `Invalid payload: Missing user handle` );
  }

  console.log( 'Search for authenticator', { identifier: parsedBody.rawId, userId } );
  const existingAuthenticator = await prisma.authenticator.findFirstOrThrow( {
    where: { identifier: parsedBody.rawId, userId },
    include: { user: true }
  } );

  if ( !existingAuthenticator ) {
    await cleanChallenges( sessionId );

    return errorResponse( 400, 'Authenticator is not registered with this site' );
  }

  let verification: VerifiedAuthenticationResponse;

  try {
    verification = await verifyAuthenticationResponse( {
      credential: parsedBody,
      expectedChallenge: `${ challenge }`,
      expectedOrigin: url.origin, // <-- TODO: Use origin from RP ID instead
      expectedRPID: url.hostname, // <-- TODO: Use hostname from env instead
      authenticator: {
        credentialPublicKey: Buffer.from( existingAuthenticator.publicKey, 'base64url' ),
        credentialID: Buffer.from( existingAuthenticator.identifier, 'base64url' ),
        counter: Number( existingAuthenticator.counter ),
        transports: existingAuthenticator.transports.split( ',' ) as AuthenticatorTransportFuture[]
      },
      requireUserVerification: true
    } );
  } catch ( error ) {
    console.error( error );

    const { message } = error as Error;

    await cleanChallenges( sessionId );

    return errorResponse( 400, message );
  }

  const { verified, authenticationInfo } = verification;

  if ( verified ) {
    // Update the authenticator's counter in the DB to the newest count in the authentication
    await prisma.authenticator.update( {
      data: {
        counter: BigInt( authenticationInfo.newCounter )
      },
      where: {
        id: existingAuthenticator.id
      }
    } );
  }

  await cleanChallenges( sessionId );

  // Sign the user token: We have authenticated the user successfully using
  // the passcode, so they may use this JWT to create their pass *key*.
  const token = issueAccessToken( existingAuthenticator.user );

  // Set the cookie on the response: It will be included in any requests to
  // the server, including for tRPC. This makes for a nice, transparent, and
  // "just works" authentication scheme.
  setJwtCookie( cookies, token );

  return jsonResponse( { verified } as VerificationResponseJSON );
};

export type VerificationResponseJSON = {
  verified: boolean;
}

export const POST = handler;
