import inject from '@rollup/plugin-inject';
import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import("vite").UserConfig} */
const config = {
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	build: {
		rollupOptions: {
			plugins: [inject({
				Buffer: ['Buffer', 'Buffer'],
			})],
		}
	},
	resolve: {
		alias: {
			'buffer': 'buffer',
			'node:buffer': 'buffer'
		}
	}
};

export default config;
