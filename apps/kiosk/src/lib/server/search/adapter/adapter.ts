export interface Indexable {
	id: string;

	[key: string]: unknown;
}

export interface Adapter {
	index(indexName: string, document: Indexable): Promise<void>;
}
