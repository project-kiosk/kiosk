export interface Indexable
{
  id: string;

  [ key: string ]: unknown;
}

export interface SearchAdapter
{
  index( indexName: string, document: Indexable ): Promise<void>;
}
