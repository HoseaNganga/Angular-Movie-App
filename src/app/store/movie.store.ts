import { inject, Injectable, signal } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { MovieService } from '../services/movie.service';
import { MovieStoreState } from './model/movie.store.model';
import {
  NowPlayingMovieResponse,
  YouTubeTrailerResponse,
  BaseMovie,
  BaseTV,
} from '../services/model/movie.service.model';

export const isNowPlayingLoading = signal(false);
export const isTrendingMoviesLoading = signal(false);
export const isTrendingTVLoading = signal(false);
export const isMovieDetailsLoading = signal(false);
export const isYoutubeTrailerLoading = signal(false);

const initialState: MovieStoreState = {
  nowPlaying: null,
  trendingMovies: null,
  featuredTV: null,
  trendingTV: null,
  selectedMovie: null,
  youtubeTrailers: {},
  categoryResults: {},
  selectedTV: null,
  externalIds: null,
  backdrops: null,
  credits: null,
  loading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class MovieStore extends signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const movieService = inject(MovieService);

    return {
      loadNowPlaying(mediaType: string, page: number) {
        isNowPlayingLoading.set(true);
        patchState(store, { loading: true });

        movieService.getNowPlaying(mediaType, page).subscribe({
          next: (res: NowPlayingMovieResponse) => {
            patchState(store, {
              nowPlaying: res,
              loading: false,
            });
            isNowPlayingLoading.set(false);
          },
          error: (err) => {
            patchState(store, {
              error: err.message || 'Failed to load now playing movies',
              loading: false,
            });
            isNowPlayingLoading.set(false);
          },
        });
      },
      getYouTubeTrailer(id: number, mediaType: string) {
        isYoutubeTrailerLoading.set(true);
        patchState(store, { loading: true });

        movieService.getYouTubeTrailer(id, mediaType).subscribe({
          next: (res: YouTubeTrailerResponse) => {
            patchState(store, {
              youtubeTrailers: {
                ...store.youtubeTrailers(),
                [id]: res,
              },
              loading: false,
            });
            isYoutubeTrailerLoading.set(false);
          },
          error: (err) => {
            patchState(store, {
              error: err.message || 'Failed to load YouTube trailer',
              loading: false,
            });
            isYoutubeTrailerLoading.set(false);
          },
        });
      },

      loadTrending(media: string, page: number) {
        if (media === 'movie') {
          isTrendingMoviesLoading.set(true);
          patchState(store, { loading: true });

          movieService.getTrending<BaseMovie>(media, page).subscribe({
            next: (res) => {
              patchState(store, {
                trendingMovies: res,
                loading: false,
              });
              isTrendingMoviesLoading.set(false);
            },
            error: (err) => {
              patchState(store, {
                error: err.message || 'Failed to load trending movies',
                loading: false,
              });
              isTrendingMoviesLoading.set(false);
            },
          });
        } else if (media === 'tv') {
          isTrendingTVLoading.set(true);
          patchState(store, { loading: true });

          movieService.getTrending<BaseTV>(media, page).subscribe({
            next: (res) => {
              patchState(store, {
                trendingTV: res,
                loading: false,
              });
              isTrendingTVLoading.set(false);
            },
            error: (err) => {
              patchState(store, {
                error: err.message || 'Failed to load trending TV shows',
                loading: false,
              });
              isTrendingTVLoading.set(false);
            },
          });
        }
      },
      loadNowPlayingTrailers(mediaType: string) {
        const nowPlaying = store.nowPlaying();

        if (!nowPlaying) return;

        nowPlaying.results.forEach((item) => {
          movieService.getYouTubeTrailer(item.id, mediaType).subscribe({
            next: (trailer) => {
              patchState(store, {
                youtubeTrailers: {
                  ...store.youtubeTrailers(),
                  [item.id]: trailer,
                },
              });
            },
            error: (err) => {
              console.error(
                `Failed to load trailer for ${item.id}:`,
                err.message
              );
            },
          });
        });
      },
      loadCategory(category: string, page: number, mediaType: string) {
        patchState(store, { loading: true });

        movieService
          .getCategory<BaseMovie | BaseTV>(category, page, mediaType)
          .subscribe({
            next: (res) => {
              const existingItems = store.categoryResults()?.[category] || [];

              patchState(store, {
                categoryResults: {
                  ...store.categoryResults(),
                  [category]: [...existingItems, ...res.results],
                },
                loading: false,
              });
            },
            error: (err) => {
              patchState(store, {
                error: err.message || 'Failed to load category data',
                loading: false,
              });
            },
          });
      },
      loadDiscoverTV(page: number) {
        isNowPlayingLoading.set(true);
        patchState(store, { loading: true });

        movieService.getTvShows(page).subscribe({
          next: (res) => {
            patchState(store, {
              featuredTV: res,
              loading: false,
            });
            isNowPlayingLoading.set(false);
          },
          error: (err) => {
            patchState(store, {
              error: err.message || 'Failed to load TV shows',
              loading: false,
            });
            isNowPlayingLoading.set(false);
          },
        });
      },
      fetchMovieById(id: number, mediaType: string) {
        isMovieDetailsLoading.set(true);
        patchState(store, { loading: true });

        movieService.getMovie(id, mediaType).subscribe({
          next: (movie) => {
            patchState(store, {
              selectedMovie: movie,
              loading: false,
            });
            isMovieDetailsLoading.set(false);
          },
          error: (err) => {
            patchState(store, {
              error: err.message || 'Failed to load movie details',
              loading: false,
            });
            isMovieDetailsLoading.set(false);
          },
        });
      },
      fetchExternalIds(id: number, mediaType: string) {
        patchState(store, { loading: true });

        movieService.getExternalId(id, mediaType).subscribe({
          next: (externalIds) => {
            patchState(store, {
              externalIds,
              loading: false,
            });
          },
          error: (err) => {
            patchState(store, {
              error: err.message || 'Failed to load external IDs',
              loading: false,
            });
          },
        });
      },
      fetchBackdrops(id: number, mediaType: string) {
        patchState(store, { loading: true });

        movieService.getBackdrops(id, mediaType).subscribe({
          next: (backdrops) => {
            patchState(store, {
              backdrops,
              loading: false,
            });
          },
          error: (err) => {
            patchState(store, {
              error: err.message || 'Failed to load backdrops',
              loading: false,
            });
          },
        });
      },
      fetchCredits(id: number, mediaType: string) {
        patchState(store, { loading: true });

        movieService.getCredits(id, mediaType).subscribe({
          next: (credits) => {
            patchState(store, {
              credits,
              loading: false,
            });
          },
          error: (err) => {
            patchState(store, {
              error: err.message || 'Failed to load cast & crew',
              loading: false,
            });
          },
        });
      },
    };
  })
) {}
