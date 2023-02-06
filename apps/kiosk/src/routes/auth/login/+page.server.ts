import prisma from '$lib/prisma';
import {
  dispatchPassCode,
  generateRandomPassCode,
  inferNameFromEmailAddress,
  issueAccessToken,
  setJwtCookie
} from '$lib/server/auth/utilities';
import type { PassCode, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { error, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  requestPassCode: async ( { request } ) => {
    const data     = await request.formData();
    const email    = data.get( 'emailAddress' );
    const register = data.get( 'register' ) === 'true';

    if ( !email || typeof email !== 'string' ) {
      return error( 400, { message: 'Missing email address' } );
    }

    let user = await prisma.user.findUnique( {
      where: { email }
    } );

    if ( !user ) {
      if ( !register ) {
        return fail( 400, { email, missing: true } );
      }

      user = await prisma.user.create( {
        data: {
          name: inferNameFromEmailAddress( email ),
          email: email,
          passwordHash: ''
        }
      } );
    }

    const code = generateRandomPassCode( 6 );

    await prisma.passCode.create( {
      data: {
        expiresAt: new Date( +new Date() + 60_000 * 5 ),
        userId: user.id,
        code
      }
    } );

    await dispatchPassCode( user, code );

    return { success: true, email };
  },

  verifyPassCode: async ( { request, cookies } ) => {
    const data = await request.formData();
    let passCode;

    // Find the user's passcode using their email address. This is just your
    // everyday login query.
    try {
      passCode = await resolvePassCode(
        data.get( 'passCode' ) as string,
        data.get( 'emailAddress' ) as string
      );
    } catch ( err ) {
      if ( !( err instanceof PrismaClientKnownRequestError ) ) {
        throw err;
      }

      if ( err.code === 'P2025' ) {
        throw error( 403, { message: 'The given passcode is invalid.' } );
      }

      console.error( `Unexpected error while retrieving passcode: ${ err.code }: ${ err.message }` );

      throw error( 401, { message: 'Authentication failed' } );
    }

    // Check whether the pass code is expired, and show a matching error to
    // the user. The remedy for them is to just request a new passcode.
    if ( passCode.expiresAt <= new Date() ) {
      throw error( 403, { message: 'The given passcode has expired.' } );
    }

    try {
      // Delete the used passcode; we don't need it anymore.
      await removePassCode( passCode );

      const { user } = passCode;

      // If the user isn't verified yet, this means they are new and should be
      // prompted to create a pass key.
      const requestPassKey = !user.verified;

      // Mark the user as verified, since they have proven to control the
      // mailbox associated with their account.
      await verifyUser( user );

      // Sign the user token: We have authenticated the user successfully using
      // the passcode, so they may use this JWT to create their pass *key*.
      const token = issueAccessToken( user );

      // Set the cookie on the response: It will be included in any requests to
      // the server, including for tRPC. This makes for a nice, transparent, and
      // "just works" authentication scheme.
      setJwtCookie( cookies, token );

      return { success: true, email: user.email, requestPassKey };
    } catch {
      throw error( 401, { message: 'Authentication failed' } );
    }
  }
};

function resolvePassCode( code: string, email: string ): Promise<PassCode & { user: User }> {
  return prisma.passCode.findFirstOrThrow( {
    where: { code, user: { email } },
    include: { user: true }
  } );
}

async function removePassCode( passCode: PassCode ): Promise<void> {
  await prisma.passCode.delete( { where: { id: passCode.id } } );
}

async function verifyUser( user: User ): Promise<void> {
  await prisma.user.update( {
    where: { id: user.id },
    data: {
      verified: true
    }
  } )
}
