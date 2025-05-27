import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MovieService } from '../../../services/movie.service';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../global/hero/hero.component';
import { MediaComponent } from '../global/media/media.component';
import { VideosComponent } from '../global/videos/videos.component';
import { ImagesComponent } from '../global/images/images.component';
import { CarouselComponent } from '../global/carousel/carousel.component';

@Component({
  selector: 'app-movies-info',
  templateUrl: './movies-info.component.html',
  imports: [
    CommonModule,
    HeroComponent,
    MediaComponent,
    VideosComponent,
    ImagesComponent,
    CarouselComponent,
  ],
  styleUrls: ['./movies-info.component.scss'],
})
export class MoviesInfoComponent implements OnInit {
  private readonly _movieService = inject(MovieService);
  private readonly router = inject(ActivatedRoute);
  private readonly _spinnerService = inject(NgxSpinnerService);
  id!: number;
  movie_data: any;
  external_data: any;
  activeTab: string = 'overview';
  videos: any[] = [];
  videoTypes: string[] = [];
  backdrops: any[] = [];
  posters: any[] = [];
  cast_data: any;
  recom_data: any[] = [];
  person_data: any;
  type: 'movie' = 'movie';

  ngOnInit() {
    this.router.params.subscribe((params: Params) => {
      this._spinnerService.show();
      this.id = +params['id'];
      this.getMovieInfo(this.id);
      this.getMovieVideos(this.id, 'movie');
      this.getMoviesBackdrop(this.id, 'movie');
      this.getMovieCast(this.id, 'movie');
      this.getMovieRecommended(this.id, 1);
      setTimeout(() => {
        this._spinnerService.hide();
      }, 4000);
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getMovieInfo(id: number) {
    this._movieService.getMovie(id, 'movie').subscribe((result: any) => {
      this.movie_data = result;
      this._movieService.getYouTubeTrailer(id, 'movie').subscribe(
        (videoRes: any) => {
          const video = videoRes.results.find(
            (vid: any) =>
              vid.site === 'YouTube' &&
              ['Trailer', 'Teaser', 'Clip'].includes(vid.type)
          );

          if (video) {
            this.movie_data.videoId = video.key;
          } else {
            console.warn('No trailer or relevant video found for this movie.');
          }
        },
        (videoError) => {
          console.error('Error fetching YouTube video:', videoError);
        }
      );

      this.getExternal(id, 'movie');
    });
  }

  getExternal(id: number, mediaType: string) {
    this._movieService.getExternalId(id, mediaType).subscribe((res: any) => {
      this.external_data = res;
    });
  }

  getMovieVideos(id: number, mediaType: string) {
    this._movieService
      .getYouTubeTrailer(id, mediaType)
      .subscribe((res: any) => {
        this.videos = res.results;
      });
  }

  getMoviesBackdrop(id: number, mediaType: string) {
    this._movieService.getBackdrops(id, mediaType).subscribe((res: any) => {
      this.backdrops = res.backdrops;
      this.posters = [];
      res.posters.forEach((poster: { file_path: string }) => {
        this.posters.push({
          ...poster,
          full_path: `https://image.tmdb.org/t/p/w342${poster.file_path}`,
        });
      });
    });
  }
  getMovieCast(id: number, mediaType: string) {
    this._movieService.getCredits(id, mediaType).subscribe(
      (res: any) => {
        this.cast_data = [];
        for (let item of res.cast) {
          this.cast_data.push({
            link: `/person/${item.id}`,
            imgSrc: item.profile_path
              ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.profile_path}`
              : null,
            name: item.name,
            character: item.character,
            popularity: item.popularity,
          });
        }
      },
      (error) => {
        console.error('Error fetching credits data', error);
      }
    );
  }
  getMovieRecommended(id: number, page: number) {
    this._movieService.getRecommended(id, page, 'movie').subscribe(
      (res: any) => {
        this.recom_data = res.results.map((item: any) => ({
          link: `/movie/${item.id}`,
          imgSrc: item.poster_path
            ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}`
            : null,
          title: item.title,
          vote: item.vote_average ? item.vote_average : 'N/A',
          rating: item.vote_average ? item.vote_average * 10 : 'N/A',
        }));
      },
      (error) => {
        console.error('Error fetching recommended movies data', error);
      }
    );
  }
}
