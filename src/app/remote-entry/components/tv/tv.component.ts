import { Component, effect, inject, signal } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { CarouselComponent } from '../global/carousel/carousel.component';
import { SliderComponent } from '../global/slider/slider.component';
import { BaseTV } from '../../../services/model/movie.service.model';
import { MovieStore } from '../../../store/movie.store';

@Component({
  selector: 'app-tv',
  templateUrl: './tv.component.html',
  imports: [SliderComponent, CarouselComponent],
  styleUrl: './tv.component.scss',
})
export class TvComponent {
  private readonly movieStore = inject(MovieStore);
  private readonly _spinnerService = inject(NgxSpinnerService);

  tvCategories = signal<{ [key: string]: any[] }>({
    onTheAirTv: [],
    popularTv: [],
    airingTodayTv: [],
    topRatedTv: [],
  });
  tv_data = signal<any[]>([]);

  constructor() {
    this._spinnerService.show();
    this.movieStore.loadDiscoverTV(1);

    effect(() => {
      const featured = this.movieStore.featuredTV();
      if (!featured || featured.results.length === 0) return;

      featured.results.forEach((tv) => {
        this.movieStore.getYouTubeTrailer(tv.id, 'tv');
      });

      this.tv_data.set(featured.results);
    });

    this.loadCategoryData('on_the_air', 'onTheAirTv');
    this.loadCategoryData('popular', 'popularTv');
    this.loadCategoryData('airing_today', 'airingTodayTv');
    this.loadCategoryData('top_rated', 'topRatedTv');

    setTimeout(() => {
      this._spinnerService.hide();
    }, 3000);
  }

  loadCategoryData(category: string, targetKey: string): void {
    this.movieStore.loadCategory(category, 1, 'tv');

    effect(() => {
      const resMap = this.movieStore.categoryResults();
      const categoryItems = resMap[category];
      if (!categoryItems || categoryItems.length === 0) return;

      const mapped = categoryItems.map((item) => ({
        link: `/tv/${item.id}`,
        linkExplorer: `/tv/category/${category}`,
        imgSrc: item.poster_path
          ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}`
          : null,
        title: (item as BaseTV).name,
        rating: item.vote_average * 10,
        vote: item.vote_average,
      }));

      this.tvCategories.update((prev) => ({
        ...prev,
        [targetKey]: mapped,
      }));
    });
  }
}
