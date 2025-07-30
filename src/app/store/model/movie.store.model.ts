import {
  NowPlayingMovieResponse,
  TrendingResponse,
  TrendingMovie,
  TrendingTV,
  MovieDetails,
  YouTubeTrailerResponse,
  BaseTV,
  ExternalIds,
  BackdropResponse,
  CastResponse,
} from '../../services/model/movie.service.model';

export interface MovieStoreState {
  nowPlaying: NowPlayingMovieResponse | null;
  featuredTV: TrendingResponse<BaseTV> | null;
  trendingMovies: TrendingResponse<TrendingMovie> | null;
  trendingTV: TrendingResponse<TrendingTV> | null;
  selectedMovie: MovieDetails | null;
  selectedTV: BaseTV | null;
  youtubeTrailers: Record<number, YouTubeTrailerResponse>;
  categoryResults: Record<string, (TrendingMovie | TrendingTV)[]>;
  externalIds: ExternalIds | null;
  backdrops: BackdropResponse | null;
  credits: CastResponse | null;
  loading: boolean;
  error: string | null;
}
