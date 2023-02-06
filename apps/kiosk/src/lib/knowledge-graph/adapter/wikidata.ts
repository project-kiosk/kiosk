import type { KnowledgeGraphAdapter, Result } from '@project-kiosk/types';

export class WikidataAdapter implements KnowledgeGraphAdapter<any>
{
  public query(
    platform: App.Platform | undefined,
    term: string,
    types: any,
    limit?: number
  ): Promise<Result[]> {
    throw new Error( 'Wikidata adapter is not implemented yet' );

    //return Promise.resolve([]);
  }
}
