import { Component, computed, inject, OnInit } from '@angular/core';

import { Subject } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { SliderComponent } from '../global/slider/slider.component';
import { CarouselComponent } from '../global/carousel/carousel.component';
import { NowPlayingMovie } from '../../../services/model/movie.service.model';
import { MovieStore } from '../../../store/movie.store';

@Component({
  selector: 'app-home',
  imports: [SliderComponent, CarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly movieStore = inject(MovieStore);
  private readonly _NgxSpinnerService = inject(NgxSpinnerService);

  slider_data = computed(() => {
    const nowPlaying = this.movieStore.nowPlaying();
    const trailersMap = this.movieStore.youtubeTrailers();

    if (!nowPlaying) return [];

    return nowPlaying.results.map((item: NowPlayingMovie) => {
      const trailerRes = trailersMap?.[item.id];
      let videoId = '';

      if (trailerRes?.results?.length) {
        const trailer = trailerRes.results.find(
          (vid) => vid.site === 'YouTube' && vid.type === 'Trailer' && vid.key
        );
        if (trailer) {
          videoId = trailer.key;
        }
      }

      return {
        ...item,
        link: `/movie/${item.id}`,
        videoId,
      };
    });
  });

  trendingMovies_slider_data = computed(() => {
    const data = this.movieStore.trendingMovies();
    if (!data) return [];

    return data.results.map((item) => ({
      link: `/movie/${item.id}`,
      imgSrc: item.poster_path
        ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}`
        : null,
      title: item.title,
      rating: item.vote_average * 10,
      vote: item.vote_average,
    }));
  });

  trendingTvShows_slider_data = computed(() => {
    const data = this.movieStore.trendingTV();
    if (!data) return [];

    return data.results.map((item) => ({
      link: `/tv/${item.id}`,
      imgSrc: item.poster_path
        ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}`
        : null,
      title: item.name,
      rating: item.vote_average * 10,
      vote: item.vote_average,
    }));
  });

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this._NgxSpinnerService.show();
    this.movieStore.loadNowPlaying('movie', 1);
    this.movieStore.loadTrending('movie', 1);
    this.movieStore.loadTrending('tv', 1);
    setTimeout(() => {
      this.movieStore.loadNowPlayingTrailers('movie');
    }, 1500);

    setTimeout(() => {
      this._NgxSpinnerService.hide();
    }, 4000);
  }
}
