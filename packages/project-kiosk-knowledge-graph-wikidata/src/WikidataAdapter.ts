import type {
  EntityType,
  KnowledgeGraphAdapter,
  Result,
} from "@project-kiosk/types";

export class WikidataAdapter implements KnowledgeGraphAdapter<EntityType[]> {
  public query(
    platform: App.Platform | undefined,
    term: string,
    types: EntityType[],
    limit?: number
  ): Promise<Result[]> {
    return Promise.reject(new Error("Not implemented yet"));
  }
}
