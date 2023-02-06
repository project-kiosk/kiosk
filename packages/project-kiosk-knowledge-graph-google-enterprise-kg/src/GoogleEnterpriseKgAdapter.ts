import type {
  EntityType,
  KnowledgeGraphAdapter,
  Result,
} from "@project-kiosk/types";
import type { JWTInput } from "google-auth-library/build/src/auth/credentials";
import { google } from "googleapis";
import { Buffer } from "node:buffer";

const defaultBaseUrl =
  "https://enterpriseknowledgegraph.googleapis.com/v1/projects/≤PROJECT_ID>/locations/global/publicKnowledgeGraphEntities:Search";

const defaultScope = "https://www.googleapis.com/auth/cloud-platform";

export class GoogleEnterpriseKgAdapter
  implements KnowledgeGraphAdapter<EntityType[]>
{
  private readonly baseUrl: string;
  private readonly scope: string;
  private readonly projectId: string;
  private readonly credentials: string;

  constructor(
    credentials: string,
    projectId: string,
    baseUrl?: string,
    scope?: string
  ) {
    this.credentials = credentials;
    this.projectId = projectId;
    this.baseUrl = baseUrl || defaultBaseUrl;
    this.scope = scope || defaultScope;
  }

  public async query(
    platform: App.Platform | undefined,
    term: string,
    types: EntityType[],
    limit: number = 10
  ): Promise<Result[]> {
    const token = await this.getAccessToken(platform);
    const url = this.resolveUrl(term, types, limit);
    const response = await this.request<SearchResult>(
      new Request(url, {
        headers: { Authorization: `Bearer ${token}` },
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
      detailedDescription: result.detailedDescription?.articleBody,
      license: result.detailedDescription?.license,
      source: result.detailedDescription?.url,
      image: result.image?.contentUrl,
    };
  }

  private resolveUrl(term: string, types: EntityType[], limit: number): URL {
    const url = new URL(this.baseUrl.replace("<PROJECT_ID>", this.projectId));
    url.searchParams.set("query", term);
    url.searchParams.set("limit", limit.toString());
    types?.forEach((type) => url.searchParams.append("types", type));

    return url;
  }

  private async request<T>(request: Request): Promise<T | undefined> {
    const response = await fetch(request);

    if (response.status !== 200) {
      console.error(
        `Could not fetch data from Google Enterprise Knowledge Graph API: ` +
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

  private async getAccessToken(
    platform: App.Platform | undefined
  ): Promise<string | undefined> {
    // const existingToken = await get<string>(platform, "googleKgToken");
    //
    // if (existingToken) {
    //   return existingToken;
    // }

    const credentials = this.loadCredentials();
    const auth = new google.auth.GoogleAuth({
      scopes: [this.scope],
      credentials,
    });

    const token = await auth.getAccessToken();

    // await set(platform, "googleKgToken", token);

    return token || undefined;
  }

  private loadCredentials(): JWTInput {
    return JSON.parse(
      Buffer.from(this.credentials, "base64").toString("utf-8")
    );
  }
}

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
