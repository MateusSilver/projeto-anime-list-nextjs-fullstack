export interface Anime {
  id: number;
  malId?: number;
  title: string;
  type: string;
  episodes: number;
  watchedEpisodes: number;
  score: number;
  status: string;
  comments?: string;
  reviewText?: string;
  imageUrl: string;
  favorite?: boolean;
}

// para details
export interface AnimeDetailsDTO {
  anime: Anime & { tags?: string[] };
  globalUserCount: number;
  globalAverageScore: number;
}
