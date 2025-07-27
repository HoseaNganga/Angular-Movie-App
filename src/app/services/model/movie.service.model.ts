export interface BaseMedia {
  adult?: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  overview: string;
  popularity: number;
  poster_path: string;
  vote_average: number;
  vote_count: number;
  media_type?: 'movie' | 'tv';
}

export interface BaseMovie extends BaseMedia {
  original_title: string;
  release_date: string;
  title: string;
}
export interface NowPlayingMovie extends BaseMovie {
  video: boolean;
}

export interface NowPlayingDates {
  maximum: string;
  minimum: string;
}

export interface NowPlayingMovieResponse {
  dates: NowPlayingDates;
  page: number;
  results: NowPlayingMovie[];
  total_pages: number;
  total_results: number;
}

export interface YouTubeTrailer {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
  id: string;
}

export interface YouTubeTrailerResponse {
  id: number;
  results: YouTubeTrailer[];
}

export interface BaseTV extends BaseMedia {
  original_name: string;
  first_air_date: string;
  name: string;
}

export type TrendingMovie = BaseMovie;
export type TrendingTV = BaseTV;

export interface TrendingResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export type MovieCategoryResponse = TrendingResponse<BaseMovie>;
export type TVCategoryResponse = TrendingResponse<BaseTV>;

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface MovieDetails extends BaseMovie {
  belongs_to_collection?: any;
  budget: number;
  genres: Genre[];
  homepage: string;
  imdb_id: string;
  origin_country: string[];
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  revenue: number;
  runtime: number;
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
  video: boolean;
  videoId?: string;
}

export interface ExternalIds {
  id: number;
  imdb_id: string | null;
  wikidata_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
}

export interface BackdropImage {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface BackdropResponse {
  backdrops: BackdropImage[];
  id: number;
  logos: BackdropImage[];
  posters: BackdropImage[];
}

export interface BasePerson {
  adult: boolean;
  credit_id: string;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
}

export interface Cast extends BasePerson {
  cast_id: number;
  character: string;
  order: number;
}

export interface Crew extends BasePerson {
  department: string;
  job: string;
}

export interface CastResponse {
  id: number;
  cast: Cast[];
  crew: Crew[];
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  episode_type: string;
  production_code: string;
  runtime: number | null;
  season_number: number;
  show_id: number;
  still_path: string | null;
}

export interface Network {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TVDetails extends BaseTV {
  created_by: any[];
  episode_run_time: number[];
  genres: Genre[];
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: Episode;
  next_episode_to_air: Episode;
  networks: Network[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_name: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  seasons: Season[];
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
  type: string;
}

export interface DetailedEpisode extends Episode {
  crew: Crew[];
  guest_stars: BasePerson[];
}

export interface TvSeasonDetails {
  _id: string;
  air_date: string;
  episodes: DetailedEpisode[];
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface PersonDetails {
  adult: boolean;
  also_known_as: string[];
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  known_for_department: string;
  name: string;
  place_of_birth: string | null;
  popularity: number;
  profile_path: string | null;
}

export interface PersonExternalIds {
  id: number;
  freebase_mid: string | null;
  freebase_id: string | null;
  imdb_id: string | null;
  tvrage_id: string | null;
  wikidata_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  tiktok_id: string | null;
  twitter_id: string | null;
  youtube_id: string | null;
}

export interface PersonImageResponse {
  id: number;
  profiles: BackdropImage[];
}
export interface PersonCastCredit extends BaseMovie {
  character: string;
  credit_id: string;
  order: number;
}

export interface PersonCreditResponse {
  id: number;
  cast: PersonCastCredit[];
  crew: Crew[];
}
export interface Genre {
  id: number;
  name: string;
}

export interface GenreResponse {
  genres: Genre[];
}

export type SearchResult = BaseMovie | BaseTV;
