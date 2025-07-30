import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ListingComponent } from '../global/listing/listing.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { MovieStore } from '../../../store/movie.store';
import { BaseMovie } from '../../../services/model/movie.service.model';
import { takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-movie-category',
  standalone: true,
  imports: [CommonModule, ListingComponent],
  templateUrl: './movie-category.component.html',
  styleUrls: ['./movie-category.component.scss'],
})
export class MovieCategoryComponent implements OnInit,OnDestroy {
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

  readonly transformedMovies = computed(() => {
    return this.categoryResults().map((item) => ({
      link: `/movie/${item.id}`,
      imgSrc: item.poster_path
        ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}`
        : null,
      title: (item as BaseMovie).title,
      rating: item.vote_average * 10,
      vote: item.vote_average,
    }));
  });

  ngOnInit() {
    this.spinner.show();

    this.route.url.pipe(takeUntil(this.destroy$)).subscribe((url) => {
      this.category = url[2]?.path;
      this.page.set(1);
      this.store.loadCategory(this.category, this.page(), 'movie');
    });

    setTimeout(() => {
      this.spinner.hide();
    }, 1500);
  }

  getTitle(category: string): string {
    switch (category) {
      case 'popular':
        return 'Popular Movies';
      case 'top_rated':
        return 'Top Rated Movies';
      case 'upcoming':
        return 'Upcoming Movies';
      case 'now_playing':
        return 'Now Playing Movies';
      default:
        return 'Movies';
    }
  }

  loadNextPage() {
    if (this.isLoading()) return;

    const nextPage = this.page() + 1;
    this.page.set(nextPage);
    this.store.loadCategory(this.category, nextPage, 'movie');
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
