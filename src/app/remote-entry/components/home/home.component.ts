import { Component, inject, OnInit } from '@angular/core';
import { MovieService } from '../../../services/movie.service';
import { delay } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { SliderComponent } from '../global/slider/slider.component';

@Component({
  selector: 'app-home',
  imports: [SliderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly _movieService = inject(MovieService);
  private readonly _NgxSpinnerService = inject(NgxSpinnerService);
  slider_data: any[] = [];
  ngOnInit(): void {
    this._NgxSpinnerService.show();
    this.getNowPlaying('movie', 1);
    setTimeout(() => {
      this._NgxSpinnerService.hide();
    }, 5000);
  }

  getNowPlaying(mediaType: 'movie', page: number) {
    this._movieService
      .getNowPlaying(mediaType, page)
      .pipe(delay(2000))
      .subscribe((res: any) => {
        this.slider_data = res.results.map((item: any) => {
          const movieItem = {
            ...item,
            link: `/movie/${item.id}`,
            videoId: '',
          };

          this._movieService.getYouTubeTrailer(item.id, 'movie').subscribe(
            (res: any) => {
              const video = res.results.find(
                (vid: any) => vid.site === 'YouTube' && vid.type === 'Trailer'
              );
              if (video) {
                movieItem.videoId = video.key;
              }
            },
            (videoError) => {
              console.error(
                'Error fetching YouTube video for Movie:',
                videoError
              );
            }
          );
          return movieItem;
        });
      });
    (error: any) => {
      console.error('Error fetching now playing data', error);
    };
  }
}
