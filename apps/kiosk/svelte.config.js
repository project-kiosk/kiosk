//noinspection JSUnusedGlobalSymbols

import { vitePreprocess } from '@sveltejs/kit/vite';
import adapter from './src/build/adapter.js';

/** @type {import("@sveltejs/kit").Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		env: {
			publicPrefix: 'PUBLIC'
		},
		csp: {
			mode: 'auto'
			//            directives: {
			//                'script-src': [ 'self' ],
			//            },
		}
	}
};

export default config;
