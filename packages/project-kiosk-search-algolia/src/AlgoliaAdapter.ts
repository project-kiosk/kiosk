import type { Indexable, SearchAdapter } from "@project-kiosk/types";
import algoliasearch from "algoliasearch";

export class AlgoliaAdapter implements SearchAdapter {
  private algolia;

  constructor(appId: string, adminKey: string) {
    this.algolia = algoliasearch(appId, adminKey);
  }

  public async index(indexName: string, document: Indexable): Promise<void> {
    const cleanDocument = Object.entries(document)
      .filter(([, value]) => value !== "id")
      .reduce(
        (carry, [key, value]) => ({
          ...carry,
          [key]: value,
        }),
        {}
      );

    await this.algolia.initIndex(indexName).saveObject(cleanDocument);
  }
}
