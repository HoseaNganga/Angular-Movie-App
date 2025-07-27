import { Component, inject, OnInit } from '@angular/core';
import { MovieService } from '../../../services/movie.service';
import { delay, Subject, takeUntil } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { SliderComponent } from '../global/slider/slider.component';
import { CarouselComponent } from '../global/carousel/carousel.component';
import {
  BaseMovie,
  BaseTV,
  NowPlayingMovie,
  NowPlayingMovieResponse,
  YouTubeTrailer,
  YouTubeTrailerResponse,
} from '../../../services/model/movie.service.model';

@Component({
  selector: 'app-home',
  imports: [SliderComponent, CarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly _movieService = inject(MovieService);
  private readonly _NgxSpinnerService = inject(NgxSpinnerService);
  slider_data: any[] = [];
  trendingMovies_slider_data: any[] = [];
  trendingTvShows_slider_data: any[] = [];

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this._NgxSpinnerService.show();
    this.getNowPlaying('movie', 1);
    this.getTrending('movie', 1, 'movies');
    this.getTrending('tv', 1, 'tvShows');
    setTimeout(() => {
      this._NgxSpinnerService.hide();
    }, 4000);
  }

  getNowPlaying(mediaType: 'movie', page: number) {
    this._movieService
      .getNowPlaying(mediaType, page)
      .pipe(delay(2000), takeUntil(this.destroy$))
      .subscribe(
        (res: NowPlayingMovieResponse) => {
          this.slider_data = res.results.map((item: NowPlayingMovie) => {
            const movieItem = {
              ...item,
              link: `/movie/${item.id}`,
              videoId: '',
            };

            this._movieService
              .getYouTubeTrailer(item.id, 'movie')
              .pipe(takeUntil(this.destroy$))
              .subscribe(
                (res: YouTubeTrailerResponse) => {
                  const video = res.results.find(
                    (vid: YouTubeTrailer) =>
                      vid.site === 'YouTube' && vid.type === 'Trailer'
                  );
                  if (video) {
                    movieItem.videoId = video.key;
                  }
                },
                (videoError) => {
                  console.error(
                    'Error fetching YouTube video for Movie:',
                    videoError
                  );
                }
              );
            return movieItem;
          });
        },
        (error: any) => {
          console.error('Error fetching now playing data', error);
        }
      );
  }

  getTrending(
    media: 'movie' | 'tv',
    page: number,
    type: 'movies' | 'tvShows'
  ): void {
    if (media === 'movie') {
      this._movieService
        .getTrending<BaseMovie>('movie', page)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res) => {
            this.trendingMovies_slider_data = res.results.map((item) => ({
              link: `/movie/${item.id}`,
              imgSrc: item.poster_path
                ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}`
                : null,
              title: item.title,
              rating: item.vote_average * 10,
              vote: item.vote_average,
            }));
          },
          (error) => {
            console.error('Error fetching trending movies:', error);
          }
        );
    } else if (media === 'tv') {
      this._movieService
        .getTrending<BaseTV>('tv', page)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res) => {
            this.trendingTvShows_slider_data = res.results.map((item) => ({
              link: `/tv/${item.id}`,
              imgSrc: item.poster_path
                ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}`
                : null,
              title: item.name,
              rating: item.vote_average * 10,
              vote: item.vote_average,
            }));
          },
          (error) => {
            console.error('Error fetching trending TV shows:', error);
          }
        );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
