import type {
  EntityType,
  KnowledgeGraphAdapter,
  Result,
} from "@project-kiosk/types";

const defaultBaseUrl =
  "https://content-kgsearch.googleapis.com/v1/entities:search";

export class GoogleKgSearchAdapter
  implements KnowledgeGraphAdapter<EntityType[]>
{
  private readonly baseUrl: string;
  private readonly referrer: string | undefined;
  private readonly apiKey: string;

  constructor(apiKey: string, referrer?: string, baseUrl?: string) {
    this.baseUrl = baseUrl || defaultBaseUrl;
    this.referrer = referrer;
    this.apiKey = apiKey;
  }

  public async query(
    platform: App.Platform | undefined,
    term: string,
    types: EntityType[],
    limit: number = 10
  ): Promise<Result[]> {
    const url = this.resolveUrl(term, types, limit);
    const response = await this.request<SearchResult>(
      new Request(url, {
        method: "GET",
        referrer: this.referrer,
        headers: { Accept: "*/*" },
      })
    );

    return response
      ? response.itemListElement.map((result) => this.resolveResult(result))
      : [];
  }

  private resolveResult({ result }: EntitySearchResult): Result {
    return {
      type: Array.isArray(result["@type"])
        ? result["@type"][0]
        : result["@type"],
      name: result.name,
      summary: result.description,
      detailedDescription: result.detailedDescription.articleBody,
      license: result.detailedDescription.license,
      source: result.detailedDescription.url,
      image: result.image?.contentUrl,
    };
  }

  private resolveUrl(term: string, types: EntityType[], limit: number): URL {
    const url = new URL(this.baseUrl);
    url.searchParams.set("key", this.apiKey);
    url.searchParams.set("query", term);
    url.searchParams.set("indent", "true");
    url.searchParams.set("limit", limit.toString());
    types?.forEach((type) => url.searchParams.append("types", type));

    return url;
  }

  private async request<T>(request: Request): Promise<T | undefined> {
    let response: Response;

    try {
      response = await fetch(request);
    } catch (error) {
      let message = "Unknown error";

      if (!this.isFetchError(error)) {
        throw error;
      }

      const code = error.cause.code;

      switch (code) {
        case "UND_ERR_CONNECT_TIMEOUT":
          message =
            "Google knowledge graph API hosts did not respond in time: The request timed out";
          break;
      }

      console.error(
        `Could not fetch data from Google Knowledge Graph API: ${message}`,
        {
          error: error.cause,
        }
      );

      return undefined;
    }

    if (response.status !== 200) {
      console.error(
        `Could not fetch data from Google Knowledge Graph API: ` +
          `The response has an error status (${response.status})`,
        { response }
      );

      return undefined;
    }

    const text = await response.text();

    if (!text) {
      console.error(`Received empty response with status ${response.status}:`, {
        text,
        response,
      });

      return undefined;
    }

    try {
      return JSON.parse(text) as T;
    } catch (error) {
      console.error(
        `Failed to parse response JSON: ${(error as Error).message}`
      );
    }
  }

  private isFetchError(error: any): error is FetchError {
    return typeof error === "object" && error !== null && "cause" in error;
  }
}

type FetchError = Error & { cause: Error & { code: string } };

interface SearchResult {
  "@context": {
    "@vocab": "http://schema.org/";
    EntitySearchResult: "goog:EntitySearchResult";
    detailedDescription: "goog:detailedDescription";
    goog: "http://schema.googleapis.com/";
    kg: "http://g.co/kg";
    resultScore: "goog:resultScore";
  };

  "@type": "ItemList";
  itemListElement: EntitySearchResult[];
}

export interface EntitySearchResult {
  "@type": "EntitySearchResult";
  result: {
    "@id": string;
    "@type": string | string[];
    description: string;
    detailedDescription: {
      articleBody: string;
      license: string;
      url: string;
    };
    image?: {
      contentUrl: string;
      url: string;
    };
    name: string;
  };
  resultScore: number;
}
