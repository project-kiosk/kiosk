import { browser } from '$app/environment';
import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/typescript-types';
import type { PageLoad } from './$types';

const init: PageLoad = async function init( { fetch } ) {
	if ( !browser ) {
		return;
	}

	let assertionOptionsResponse;
	let assertionOptions: PublicKeyCredentialRequestOptionsJSON;

	try {
		assertionOptionsResponse   = await fetch( '/auth/assertion/generate', {
			headers: { accept: 'application/json' }
		} );
		const assertionOptionsJson = await assertionOptionsResponse.text();
		assertionOptions           = JSON.parse( assertionOptionsJson );
	} catch ( error ) {
		console.error( 'Failed to generate assertion options', error );

		return;
	}
};

// noinspection JSUnusedGlobalSymbols
export const load = init;
