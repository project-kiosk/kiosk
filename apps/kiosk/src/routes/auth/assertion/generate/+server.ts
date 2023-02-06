import prisma from '$lib/prisma';
import { getSessionIdCookie, resolveUserId } from '$lib/server/auth/utilities';
import { jsonResponse } from '$lib/server/utilities';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import type { GenerateAuthenticationOptionsOpts } from '@simplewebauthn/server/dist/authentication/generateAuthenticationOptions';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/typescript-types';
import type { RequestHandler } from '@sveltejs/kit';
import { Buffer } from 'node:buffer';

const handler: RequestHandler = async function( { url, cookies } ): Promise<Response> {
	const sessionId: string = getSessionIdCookie( cookies ) as string;
	const userId            = resolveUserId( cookies );

	const options: GenerateAuthenticationOptionsOpts = {
		userVerification: 'required',
		rpID: url.hostname,
		timeout: 60_000
	};

	if ( userId ) {
		const user = await prisma.user.findFirstOrThrow( {
			where: { id: userId },
			select: {
				name: true,
				email: true,
				authenticators: true
			}
		} );

		options.allowCredentials = user.authenticators.map( ( device ) => ( {
			type: 'public-key',
			id: Buffer.from( device.identifier, 'base64url' ),
			transports: device.transports.split( ',' ) as AuthenticatorTransportFuture[]
		} ) );
	}

	const responseData = generateAuthenticationOptions( options );
	const timeout      = responseData.timeout || options.timeout || 60_000;

	await prisma.authenticatorChallenge.create( {
		data: {
			expiresAt: new Date( +new Date() + timeout ),
			challenge: responseData.challenge,
			sessionIdentifier: sessionId
		}
	} );

	return jsonResponse( responseData );
};

// noinspection JSUnusedGlobalSymbols
export const GET = handler;
