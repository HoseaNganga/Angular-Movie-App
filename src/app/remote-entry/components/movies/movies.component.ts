import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { delay } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { MovieService } from '../../../services/movie.service';
import { SliderComponent } from '../global/slider/slider.component';
import { CarouselComponent } from '../global/carousel/carousel.component';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  imports: [SliderComponent, CarouselComponent,RouterModule],
  styleUrls: ['./movies.component.scss'],
})
export class MoviesComponent implements OnInit {
  private readonly _movieService = inject(MovieService);
  private readonly route = inject(ActivatedRoute);
  private readonly _spinnerService = inject(NgxSpinnerService);
  hero: any;
  movies_data: any[] = [];

  movieCategories: { [key: string]: any[] } = {
    nowPlayingMovies: [],
    popularMovies: [],
    upcomingMovies: [],
    topRatedMovies: [],
  };

  ngOnInit() {
    this._spinnerService.show();
    this.getNowPlaying(2);
    this.loadMovies();
    setTimeout(() => {
      this._spinnerService.hide();
    }, 4000);
  }

  getNowPlaying(page: number): void {
    this._movieService
      .getNowPlaying('movie', page)
      .pipe(delay(2000))
      .subscribe(
        (res: any) => {
          this.movies_data = res.results.map((item: any) => ({
            ...item,
            link: `/movie/${item.id}`,
          }));
        },
        (error) => {
          console.error('Error fetching now playing data', error);
        }
      );
  }

  loadMovies() {
    this.fetchMovies('now_playing', 'nowPlayingMovies');
    this.fetchMovies('popular', 'popularMovies');
    this.fetchMovies('upcoming', 'upcomingMovies');
    this.fetchMovies('top_rated', 'topRatedMovies');
  }

  fetchMovies(category: string, property: string): void {
    this._movieService.getCategory(category, 1, 'movie').subscribe(
      (res) => {
        this.movieCategories[property] = res.results.map((item: any) => ({
          link: `/movie/${item.id}`,
          linkExplorer: `/movie/category/${category}`,
          imgSrc: item.poster_path
            ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}`
            : null,
          title: item.title,
          rating: item.vote_average * 10,
          vote: item.vote_average,
        }));
      },
      (error) => {
        console.error(`Error fetching ${category} movies:`, error);
      }
    );
  }
}
