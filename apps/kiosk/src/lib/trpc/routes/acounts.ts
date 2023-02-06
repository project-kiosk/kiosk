import prisma from '$lib/prisma';
import {
  dispatchPassCode,
  generateRandomPassCode,
  inferNameFromEmailAddress
} from '$lib/server/auth/utilities';
import { auth } from '$lib/trpc/middleware/auth';
import { logger } from '$lib/trpc/middleware/logger';
import { t } from '$lib/trpc/t';
import { z } from 'zod';

function procedure( guarded: boolean = false ) {
  return t.procedure.meta( { guarded } ).use( logger ).use( auth );
}

export const accounts = t.router( {
  exists: procedure()
  .input( z.string() )
  .query( async ( { input } ) => {
    const count = await prisma.user.count( {
      where: { email: input }
    } );

    return count > 0;
  } ),

  create: procedure()
  .input(
    z.object( {
      name: z.string().optional(),
      emailAddress: z.string()
    } )
  )
  .mutation( async ( { input: { emailAddress, name } } ) => {
    const user = await prisma.user.create( {
      data: {
        name: name || inferNameFromEmailAddress( emailAddress ),
        email: emailAddress,
        passwordHash: ''
      }
    } );

    const code = generateRandomPassCode( 6 );

    await prisma.passCode.create( {
      data: {
        expiresAt: new Date( +new Date() + 60_000 * 5 ),
        userId: user.id,
        code
      }
    } );

    await dispatchPassCode( user, code );

    return user.id;
  } ),

  requestPassCode: procedure()
  .input(
    z.object( {
      emailAddress: z.string()
    } )
  )
  .mutation( async ( { input } ) => {
    const emailAddress = input.emailAddress;
    let user           = await prisma.user.findUnique( {
      where: { email: emailAddress }
    } );

    if ( !user ) {
      user = await prisma.user.create( {
        data: {
          name: inferNameFromEmailAddress( emailAddress ),
          email: emailAddress,
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

    console.log( `Dispatching passcode notification with code ${ code }` );
    await dispatchPassCode( user, code );
  } ),
} );
