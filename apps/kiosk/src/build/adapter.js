import adapterAuto from '@sveltejs/adapter-auto';
import adapterNode from '@sveltejs/adapter-node';

/** @typedef {import("@sveltejs/kit").Adapter} Adapter */

/**
 * @return {Promise<Adapter|undefined>}
 */
async function resolveAdapter() {
	if (process.env.TARGET_ADAPTER && process.env.TARGET_ADAPTER === 'node') {
		return adapterNode();
	}

	return adapterAuto();
}

/** @type {() => Adapter} */
export default () => ({
	name: '@sveltejs/adapter-auto',
	adapt: async (builder) => {
		const adapter = await resolveAdapter();

		if (adapter) {
			return adapter.adapt(builder);
		}
	}
});
