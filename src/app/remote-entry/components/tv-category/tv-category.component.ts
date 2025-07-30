import {
  Component,
  OnInit,
  HostListener,
  inject,
  OnDestroy,
  computed,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { ListingComponent } from '../global/listing/listing.component';
import { Subject } from 'rxjs';
import { BaseTV } from '../../../services/model/movie.service.model';
import { MovieStore } from '../../../store/movie.store';

@Component({
  selector: 'app-tv-category',
  templateUrl: './tv-category.component.html',
  imports: [CommonModule, ListingComponent],
  styleUrl: './tv-category.component.scss',
})
export class TvCategoryComponent implements OnDestroy, OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly spinner = inject(NgxSpinnerService);
  private readonly store = inject(MovieStore);
  private readonly destroy$ = new Subject<void>();

  category!: string;
  page = signal(1);

  readonly isLoading = computed(() => this.store.loading());
  readonly categoryResults = computed(() => {
    return this.store.categoryResults()?.[this.category] ?? [];
  });

  readonly transformedTvShows = computed(() => {
    return this.categoryResults().map((item) => ({
      link: `/movie/${item.id}`,
      imgSrc: item.poster_path
        ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}`
        : null,
      title: (item as BaseTV).name,
      rating: item.vote_average * 10,
      vote: item.vote_average,
    }));
  });

  tvCategories: { [key: string]: any[] } = {
    popularTv: [],
    topRatedTv: [],
    onTheAirTv: [],
    airingTodayTv: [],
  };

  ngOnInit() {
    this.spinner.show();

    this.route.url.subscribe((url) => {
      this.category = url[2].path;
      this.page.set(1);
      this.store.loadCategory(this.category, this.page(), 'tv');
    });

    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  getTitle(category: string): string {
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

  loadNextPage() {
    if (this.isLoading()) return;

    const nextPage = this.page() + 1;
    this.page.set(nextPage);
    this.store.loadCategory(this.category, nextPage, 'tv');
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const windowHeight = window.innerHeight;
    const scrollHeight =
      document.documentElement.scrollHeight || document.body.scrollHeight;

    const scrolledPercentage = (scrollTop + windowHeight) / scrollHeight;

    if (scrolledPercentage >= 0.5 && !this.isLoading()) {
      this.loadNextPage();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.spinner.hide();
  }
}
