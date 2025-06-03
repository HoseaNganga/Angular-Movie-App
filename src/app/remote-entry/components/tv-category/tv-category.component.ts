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

@Component({
  selector: 'app-tv-category',
  templateUrl: './tv-category.component.html',
  imports: [CommonModule, ListingComponent],
  styleUrl: './tv-category.component.scss',
})
export class TvCategoryComponent implements OnDestroy {
  category!: string;
  page: number = 1;
  isLoading: boolean = false;
  tvCategories: { [key: string]: any[] } = {
    popularTv: [],
    topRatedTv: [],
    onTheAirTv: [],
    airingTodayTv: [],
  };

  private readonly route = inject(ActivatedRoute);
  private readonly _movieService = inject(MovieService);
  private readonly spinner = inject(NgxSpinnerService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit() {
    this.spinner.show();

    this.route.url.subscribe((url) => {
      this.category = url[2].path;
      this.page = 1;
      this.loadCategoryTv(this.category);
    });

    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  loadCategoryTv(category: string) {
    this.fetchTv(category, this.getCategoryProperty(category));
  }

  fetchTv(category: string, property: string): void {
    if (this.isLoading) return;
    this.isLoading = true;

    this._movieService
      .getCategory(category, this.page, 'tv')
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          this.tvCategories[property].push(
            ...response.results.map((item: any) => ({
              link: `/tv/${item.id}`,
              imgSrc: item.poster_path
                ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}`
                : null,
              title: item.name,
              rating: item.vote_average * 10,
              vote: item.vote_average,
            }))
          );
          this.isLoading = false;
          this.page++;
        },
        (error) => {
          console.error(`Error fetching ${category} tv:`, error);
          this.isLoading = false;
        }
      );
  }

  getCategoryProperty(category: string): string {
    switch (category) {
      case 'popular':
        return 'popularTv';
      case 'top_rated':
        return 'topRatedTv';
      case 'on_the_air':
        return 'onTheAirTv';
      case 'airing_today':
        return 'airingTodayTv';
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
      this.loadCategoryTv(this.category);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
