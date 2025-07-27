import {
  Component,
  OnInit,
  HostListener,
  inject,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../../services/movie.service';
import { NgxSpinnerService } from 'ngx-spinner';

import { CommonModule } from '@angular/common';
import { ListingComponent } from '../global/listing/listing.component';
import { Subject, takeUntil } from 'rxjs';
import {
  BaseMovie,
  TrendingResponse,
} from '../../../services/model/movie.service.model';

@Component({
  selector: 'app-movie-category',
  templateUrl: './movie-category.component.html',
  imports: [CommonModule, ListingComponent],
  styleUrls: ['./movie-category.component.scss'],
})
export class MovieCategoryComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly _movieService = inject(MovieService);
  private readonly _spinnerService = inject(NgxSpinnerService);
  private readonly destroy$ = new Subject<void>();
  category!: string;
  page: number = 1;
  isLoading: boolean = false;
  movieCategories: { [key: string]: any[] } = {
    popularMovies: [],
    topRatedMovies: [],
    upcomingMovies: [],
    nowPlayingMovies: [],
  };

  ngOnInit() {
    this._spinnerService.show();

    this.route.url.subscribe((url) => {
      this.category = url[2].path;
      this.page = 1;
      this.loadCategoryMovies(this.category);
    });

    setTimeout(() => {
      this._spinnerService.hide();
    }, 2000);
  }

  loadCategoryMovies(category: string) {
    this.fetchMovies(category, this.getCategoryProperty(category));
  }

  fetchMovies(category: string, property: string): void {
    if (this.isLoading) return;
    this.isLoading = true;

    this._movieService
      .getCategory<BaseMovie>(category, this.page, 'movie')
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response: TrendingResponse<BaseMovie>) => {
          const results = response.results;
          for (const item of results) {
            const movie = {
              link: `/movie/${item.id}`,
              imgSrc: item.poster_path
                ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}`
                : null,
              title: item.title,
              rating: item.vote_average * 10,
              vote: item.vote_average,
            };
            this.movieCategories[property].push(movie);
          }
          this.isLoading = false;
          this.page++;
        },
        (error) => {
          console.error(`Error fetching ${category} movies:`, error);
          this.isLoading = false;
        }
      );
  }

  getCategoryProperty(category: string): string {
    switch (category) {
      case 'popular':
        return 'popularMovies';
      case 'top_rated':
        return 'topRatedMovies';
      case 'upcoming':
        return 'upcomingMovies';
      case 'now_playing':
        return 'nowPlayingMovies';
      default:
        return '';
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    const pos =
      (document.documentElement.scrollTop || document.body.scrollTop) +
      window.innerHeight;
    const max =
      document.documentElement.scrollHeight || document.body.scrollHeight;

    if (pos > max - 100) {
      this.loadCategoryMovies(this.category);
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this._spinnerService.hide();
    this.isLoading = false;
  }
}
