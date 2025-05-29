import { Component, OnInit, inject } from '@angular/core';

import { MovieService } from '../../../services/movie.service';
import { ActivatedRoute, Params } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { HeroComponent } from '../global/hero/hero.component';
import { CommonModule } from '@angular/common';
import { MediaComponent } from '../global/media/media.component';
import { ImagesComponent } from '../global/images/images.component';
import { VideosComponent } from '../global/videos/videos.component';
import { CarouselComponent } from '../global/carousel/carousel.component';
import { EpisodesComponent } from '../global/episodes/episodes.component';

@Component({
  selector: 'app-tv-info',
  templateUrl: './tv-info.component.html',
  imports: [
    HeroComponent,
    CommonModule,
    MediaComponent,
    ImagesComponent,
    VideosComponent,
    CarouselComponent,
    EpisodesComponent,
  ],
  styleUrls: ['./tv-info.component.scss'],
})
export class TvInfoComponent implements OnInit {
  id!: number;
  tv_data: any;
  external_data: any;
  activeTab: string = 'overview';
  video_data: any;
  videos: any[] = [];
  filteredVideos: any[] = [];
  videoTypes: string[] = [];
  backdrops: any[] = [];
  posters: any[] = [];
  cast_data: any;
  recom_data: any[] = [];
  type: 'tv' = 'tv';

  private readonly _movieService = inject(MovieService);
  private readonly router = inject(ActivatedRoute);
  private readonly spinner = inject(NgxSpinnerService);

  ngOnInit() {
    this.router.params.subscribe((params: Params) => {
      this.id = +params['id'];
      this.getTvInfo(this.id);
      this.getTvVideos(this.id);
      this.getTvBackdrop(this.id);
      this.getMovieCast(this.id);
      this.getTvRecommended(this.id, 1);
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getTvInfo(id: number) {
    this._movieService.getTvShow(id).subscribe((result: any) => {
      this.tv_data = result;
      this.getExternal(id);
    });
  }

  getExternal(id: number) {
    this._movieService.getExternalId(id, 'tv').subscribe((result: any) => {
      this.external_data = result;
    });
  }

  getTvVideos(id: number) {
    this._movieService.getYouTubeTrailer(id, 'tv').subscribe((res: any) => {
      this.video_data = res.results.length ? res.results[0] : null;
      this.videos = res.results;
      this.filteredVideos = this.videos;
      this.videoTypes = [
        'ALL',
        ...new Set(this.videos.map((video) => video.type)),
      ];
    });
  }

  filterVideos(event: Event): void {
    const filterValue = (event.target as HTMLSelectElement).value;
    this.filteredVideos =
      filterValue === 'ALL'
        ? this.videos
        : this.videos.filter((video) => video.type === filterValue);
  }

  getTvBackdrop(id: number) {
    this._movieService.getBackdrops(id, 'tv').subscribe((res: any) => {
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

  getMovieCast(id: number) {
    this._movieService.getCredits(id, 'tv').subscribe(
      (res: any) => {
        this.cast_data = res.cast.map((item: any) => ({
          link: `/person/${item.id}`,
          imgSrc: item.profile_path
            ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.profile_path}`
            : null,
          name: item.name,
          character: item.character,
          popularity: item.popularity,
        }));
      },
      (error) => {
        console.error('Error fetching credits data', error);
      }
    );
  }

  getTvRecommended(id: number, page: number) {
    this._movieService.getRecommended(id, page, 'tv').subscribe(
      (res: any) => {
        this.recom_data = res.results.map((item: any) => ({
          link: `/tv/${item.id}`,
          imgSrc: item.poster_path
            ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}`
            : null,
          title: item.name,
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
