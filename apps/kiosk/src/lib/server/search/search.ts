import { SEARCH_ADAPTER } from '$env/static/private';
import type { Adapter, Indexable } from '$lib/server/search/adapter/adapter';
import { AlgoliaAdapter } from '$lib/server/search/adapter/algolia';

export async function index( indexName: string, document: Indexable ): Promise<void> {
	await resolveAdapter( SEARCH_ADAPTER ).index( indexName, document );
}

function resolveAdapter( adapterType: string ): Adapter {
	let adapter: Adapter;

	switch ( adapterType ) {
		case 'algolia':
			adapter = new AlgoliaAdapter();
			break;

		default:
			throw new Error( `Unknown adapter "${ adapterType }"` );
	}

	return adapter;
}
