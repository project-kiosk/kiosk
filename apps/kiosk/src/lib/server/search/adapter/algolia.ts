import type { Adapter, Indexable } from '$lib/server/search/adapter/adapter';

// import { algoliasearch } from 'algoliasearch';

export class AlgoliaAdapter implements Adapter {
	private algolia;

	constructor() {
		 // this.algolia = algoliasearch(env.ALGOLIA_APP_ID, env.ALGOLIA_ADMIN_API_KEY);
		this.algolia = {
			addOrUpdateObject(obj: any) {
				throw new Error('TODO: Fix algolia');
			}
		};
	}

	public async index(
		indexName: string,
		document: Indexable,
		id: string = document.id
	): Promise<void> {
		/*
     const cleanDocument = Object.entries( document )
     .filter( ( [ , value ] ) => value !== 'id' )
     .reduce(
     ( carry, [ key, value ] ) => ( {
     ...carry,
     [ key ]: value
     } ),
     {}
     );

     await this.algolia.initIndex( indexName ).saveObject( cleanDocument );
     */
		await this.algolia.addOrUpdateObject({ indexName, objectID: id, body: document });
	}
}
