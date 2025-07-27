import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../../services/movie.service';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ListingComponent } from '../global/listing/listing.component';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  BaseMovie,
  BaseTV,
  GenreResponse,
  TrendingResponse,
} from '../../../services/model/movie.service.model';

@Component({
  selector: 'app-genre',
  imports: [FormsModule, CommonModule, ListingComponent],
  templateUrl: './genre.component.html',
  styleUrl: './genre.component.scss',
})
export class GenreComponent implements OnInit, OnDestroy {
  movieGenreList: any[] = [];
  tvShowsGenreList: any[] = [];
  defaultMovieGenre: string = 'Action';
  defaultMediaType: string = 'movie';
  genre_data: any[] = [];
  page: number = 1;
  defaultId: number = 28;
  isLoading: boolean = false;

  private readonly _movieService = inject(MovieService);
  private readonly spinner = inject(NgxSpinnerService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.spinner.show();
    this.getMovieGenres();
    this.getTvShowsGenres();
    this.getGenreById(this.defaultId, this.defaultMediaType, this.page);
    setTimeout(() => this.spinner.hide(), 2000);
  }

  getMovieGenres() {
    this._movieService
      .getMovieGenres()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: GenreResponse) => {
        this.movieGenreList = res.genres;
      });
  }

  getTvShowsGenres() {
    this._movieService
      .getTvGenres()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: GenreResponse) => {
        this.tvShowsGenreList = res.genres;
      });
  }

  getGenreById<T extends BaseMovie | BaseTV>(
    id: number,
    mediaType: string,
    page: number
  ) {
    if (this.isLoading) return;

    this.isLoading = true;

    this._movieService
      .getGenreById<T>(id, mediaType, page)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: TrendingResponse<BaseMovie | BaseTV>) => {
          const results = res.results.map((item: BaseMovie | BaseTV) => ({
            link: `/${mediaType}/${item.id}`,
            imgSrc: item.poster_path
              ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}`
              : null,
            title:
              mediaType === 'tv'
                ? (item as BaseTV).name
                : (item as BaseMovie).title,
            rating: item.vote_average * 10,
            vote: item.vote_average,
          }));

          this.genre_data = [...this.genre_data, ...results];
          this.page++;
          this.isLoading = false;
        },
        (err) => {
          console.error(err);
          this.isLoading = false;
        }
      );
  }

  onGenreChange(event: any, type: string) {
    const selectedGenre = +event.target.value;

    this.spinner.show();
    this.page = 1;
    this.genre_data = [];
    this.defaultMediaType = type;
    this.defaultId = selectedGenre;

    setTimeout(() => {
      if (type === 'tv') {
        this.getGenreById<BaseMovie>(selectedGenre, type, this.page);
      } else {
        this.getGenreById<BaseTV>(selectedGenre, type, this.page);
      }
      this.spinner.hide();
    }, 1000);
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const pos =
      (document.documentElement.scrollTop || document.body.scrollTop) +
      window.innerHeight;
    const max =
      document.documentElement.scrollHeight || document.body.scrollHeight;

    if (pos > max - 100) {
      this.getGenreById(this.defaultId, this.defaultMediaType, this.page);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
