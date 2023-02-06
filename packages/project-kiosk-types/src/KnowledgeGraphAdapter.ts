export type EntityType =
  | "Book"
  | "BookSeries"
  | "EducationalOrganization"
  | "Event"
  | "GovernmentOrganization"
  | "LocalBusiness"
  | "Movie"
  | "MovieSeries"
  | "MusicAlbum"
  | "MusicGroup"
  | "MusicRecording"
  | "Organization"
  | "Periodical"
  | "Person"
  | "Place"
  | "SportsTeam"
  | "TVEpisode"
  | "TVSeries"
  | "VideoGame"
  | "VideoGameSeries"
  | "WebSite";

export type Result = {
  type: string;
  name: string;
  summary: string;
  detailedDescription?: string;
  license?: string;
  source?: string;
  image?: string;
};

export interface KnowledgeGraphAdapter<SupportedTypes extends EntityType[]>
{
  query(
    platform: App.Platform | undefined,
    term: string,
    types: SupportedTypes,
    limit?: number
  ): Promise<Result[]>;
}
