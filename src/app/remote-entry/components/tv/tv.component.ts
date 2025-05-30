import { Component, inject, OnDestroy } from '@angular/core';
import { MovieService } from '../../../services/movie.service';
import { delay, takeUntil } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { CarouselComponent } from '../global/carousel/carousel.component';
import { SliderComponent } from '../global/slider/slider.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-tv',
  templateUrl: './tv.component.html',
  imports: [SliderComponent, CarouselComponent],
  styleUrl: './tv.component.scss',
})
export class TvComponent implements OnDestroy {
  private readonly _movieService = inject(MovieService);
  private readonly spinner = inject(NgxSpinnerService);
  private readonly destroy$ = new Subject<void>();
  tv_data: any[] = [];
  tvCategories: { [key: string]: any[] } = {
    onTheAirTv: [],
    popularTv: [],
    airingTodayTv: [],
    topRatedTv: [],
  };

  ngOnInit() {
    this.spinner.show();
    this.loadMovies();
    this.getTvDiscover(1);
    setTimeout(() => {
      this.spinner.hide();
    }, 4000);
  }

  loadMovies(): void {
    this.fetchMovies('popular', 'popularTv');
    this.fetchMovies('top_rated', 'topRatedTv');
    this.fetchMovies('on_the_air', 'onTheAirTv');
    this.fetchMovies('airing_today', 'airingTodayTv');
  }

  getTvDiscover(page: number) {
    this._movieService
      .getTvShows(page)
      .pipe(delay(2000), takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          this.tv_data = res.results.map((item: any) => {
            const tvItem = {
              ...item,
              link: `/tv/${item.id}`,
              videoId: '',
            };

            this._movieService
              .getYouTubeTrailer(item.id, 'tv')
              .pipe(takeUntil(this.destroy$))
              .subscribe(
                (videoRes: any) => {
                  const video = videoRes.results.find(
                    (vid: any) =>
                      vid.site === 'YouTube' && vid.type === 'Trailer'
                  );
                  if (video) {
                    tvItem.videoId = video.key;
                  }
                },
                (videoError) => {
                  console.error(
                    'Error fetching YouTube video for TV:',
                    videoError
                  );
                }
              );

            return tvItem;
          });
        },
        (error) => {
          console.error('Error fetching TV discover data', error);
        }
      );
  }

  fetchMovies(category: string, property: string): void {
    this._movieService
      .getCategory(category, 1, 'tv')
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.tvCategories[property] = response.results.map((item: any) => ({
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
          console.error(`Error fetching ${category} movies:`, error);
        }
      );
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
