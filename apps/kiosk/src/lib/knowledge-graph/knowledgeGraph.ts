import { env } from '$env/dynamic/private';
import type { EntityType, KnowledgeGraphAdapter, Result } from '@project-kiosk/types';
import { GoogleEnterpriseKgAdapter } from './adapter/googleEnterpriseKg';
import { GoogleKgSearchAdapter } from './adapter/googleKgSearch';
import { WikidataAdapter } from './adapter/wikidata';

export async function query(
	platform: App.Platform | undefined,
	term: string,
	types: EntityType[],
	limit: number = 10
): Promise<Result[]> {
	return resolveAdapter( env.KNOWLEDGE_GRAPH_ADAPTER ).query( platform, term, types, limit );
}

function resolveAdapter<T extends EntityType[]>( adapterType: string ): KnowledgeGraphAdapter<T> {
	let adapter: KnowledgeGraphAdapter<T>;

	switch ( adapterType ) {
		case 'wikidata':
			adapter = new WikidataAdapter();
			break;

		case 'googleKgSearch':
			adapter = new GoogleKgSearchAdapter();
			break;

		case 'googleEnterpriseKg':
			adapter = new GoogleEnterpriseKgAdapter();
			break;

		default:
			throw new Error( `Unknown adapter "${ adapterType }"` );
	}

	return adapter;
}
