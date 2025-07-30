import { Component, inject, signal, effect } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SliderComponent } from '../global/slider/slider.component';
import { CarouselComponent } from '../global/carousel/carousel.component';
import { MovieStore } from '../../../store/movie.store';
import { BaseMovie } from '../../../services/model/movie.service.model';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  imports: [SliderComponent, CarouselComponent, RouterModule],
  styleUrls: ['./movies.component.scss'],
  standalone: true,
})
export class MoviesComponent {
  private readonly movieStore = inject(MovieStore);
  private readonly _spinnerService = inject(NgxSpinnerService);

  movies_data = signal<any[]>([]);
  movieCategories = signal<{ [key: string]: any[] }>({
    nowPlayingMovies: [],
    popularMovies: [],
    upcomingMovies: [],
    topRatedMovies: [],
  });


  constructor() {
    this._spinnerService.show();

    this.movieStore.loadNowPlaying('movie', 2);
    this.loadCategoryData('now_playing', 'nowPlayingMovies');
    this.loadCategoryData('popular', 'popularMovies');
    this.loadCategoryData('upcoming', 'upcomingMovies');
    this.loadCategoryData('top_rated', 'topRatedMovies');


    effect(() => {
      const nowPlaying = this.movieStore.nowPlaying();
      if (nowPlaying) {
        this.movies_data.set(
          nowPlaying.results.map((item) => ({
            ...item,
            link: `/movie/${item.id}`,
          }))
        );
      }
    });

    setTimeout(() => {
      this._spinnerService.hide();
    }, 3000);
  }

  loadCategoryData(category: string, targetKey: string): void {
    this.movieStore.loadCategory(category, 1, 'movie');

    effect(() => {
      const resMap = this.movieStore.categoryResults();
      const categoryItems = resMap[category];
      if (!categoryItems || categoryItems.length === 0) return;

      const mapped = categoryItems.map((item) => ({
        link: `/movie/${item.id}`,
        linkExplorer: `/movie/category/${category}`,
        imgSrc: item.poster_path
          ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}`
          : null,
        title: (item as BaseMovie).title,
        rating: item.vote_average * 10,
        vote: item.vote_average,
      }));

      this.movieCategories.update((prev) => ({
        ...prev,
        [targetKey]: mapped,
      }));
    });
  }
}
