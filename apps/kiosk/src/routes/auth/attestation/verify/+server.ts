import prisma from '$lib/prisma';
import {
  getSessionIdCookie,
  resolveCurrentChallenge,
  resolveUserId
} from '$lib/server/auth/utilities';
import { errorResponse, jsonResponse } from '$lib/server/utilities';
import type { VerifiedRegistrationResponse } from '@simplewebauthn/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationCredentialJSON } from '@simplewebauthn/typescript-types';
import type { RequestHandler } from '@sveltejs/kit';
import { Buffer } from 'node:buffer';
import parseUserAgent from 'ua-parser-js';

const handler: RequestHandler = async function( { url, request, cookies } ): Promise<Response> {
  const sessionId: string = getSessionIdCookie( cookies ) as string;
  let challenge: string;

  try {
    challenge = await resolveCurrentChallenge( sessionId );
  } catch ( error ) {
    const { message } = error as Error;

    return errorResponse( 400, message );
  }

  const userId = resolveUserId( cookies );
  let parsedBody: RegistrationCredentialJSON;

  // TODO: Validation

  try {
    parsedBody = await request.json();
  } catch ( error ) {
    // Type guard
    if ( !( error instanceof Error ) ) {
      throw error;
    }

    return errorResponse( 400, `Invalid request body: ${ error.message }` );
  }

  const user = await prisma.user.findUniqueOrThrow( {
    where: { id: userId },
    select: { authenticators: true }
  } );

  let verification: VerifiedRegistrationResponse;

  try {
    verification = await verifyRegistrationResponse( {
      credential: parsedBody,
      expectedChallenge: challenge,

      // TODO: Replace with env vars
      expectedOrigin: url.origin, // <-- TODO: Use origin from RP ID instead
      expectedRPID: url.hostname // <-- TODO: Use hostname from env instead
    } );
  } catch ( error ) {
    console.error( error );

    const { message } = error as Error;

    return errorResponse( 400, message );
  }

  const { verified, registrationInfo } = verification;

  if ( verified && registrationInfo ) {
    const {
            credentialPublicKey,
            credentialBackedUp,
            credentialDeviceType,
            credentialID,
            counter,
            credentialType
          } = registrationInfo;

    const existingDevice = user.authenticators.find( ( device ) =>
      Buffer.from( device.identifier, 'base64url' ).equals( credentialID )
    );

    if ( !existingDevice ) {
      const { os, browser } = parseUserAgent( request.headers.get( 'user-agent' ) || '' );
      const handle          = `${ browser.name } on ${ os.name } ${ os.version }`;
      const agent           = browser.name;

      await prisma.authenticator.create( {
        data: {
          backedUp: credentialBackedUp,
          counter: BigInt( counter ),
          deviceType: credentialDeviceType,
          identifier: credentialID.toString( 'base64url' ),
          publicKey: credentialPublicKey.toString( 'base64url' ),
          transports: parsedBody.transports?.join( ',' ) || '',
          type: credentialType,
          userId: userId as string,
          handle,
          agent
        }
      } );
    }
  }

  await prisma.authenticatorChallenge.deleteMany( {
    where: { sessionIdentifier: sessionId }
  } );

  return jsonResponse( { verified } as VerificationResponseJSON );
};

export type VerificationResponseJSON = {
  verified: boolean;
}

export const POST = handler;
