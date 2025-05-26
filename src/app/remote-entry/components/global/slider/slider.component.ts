import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, animate, style } from '@angular/animations';
import { TruncatePipe } from '../pipes/Truncate/truncate.pipe';
import { NumberWithCommasPipe } from '../pipes/NumberWithCommas/numberwithcommas.pipe';
import { MovieService } from '../../../../services/movie.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-slider',
  imports: [
    CommonModule,
    RouterModule,
    TruncatePipe,
    NumberWithCommasPipe,
    ModalComponent,
  ],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class SliderComponent implements OnInit {
  @Input() data: any[] = [];
  @ViewChild(ModalComponent) modal!: ModalComponent;
  private readonly _movieService = inject(MovieService);
  current = 0;
  private intervalId: any;

  ngOnInit(): void {
    this.sliderTimer();
  }

  sliderTimer() {
    this.intervalId = setInterval(() => {
      this.current = (this.current + 1) % this.data.length;
    }, 10000);
  }

  openTrailer(hero: any) {
    const mediaType = hero.number_of_seasons ? 'tv' : 'movie';
    this._movieService.getYouTubeTrailer(hero.id, mediaType).subscribe(
      (res: any) => {
        const video = res.results.find(
          (vid: any) =>
            vid.site === 'YouTube' &&
            ['Trailer', 'Teaser', 'Clip'].includes(vid.type)
        );
        if (video) {
          const videoUrl = `https://www.youtube.com/embed/${video.key}?rel=0&autoplay=1&mute=1`;
          this.modal.openModal(videoUrl);
        } else {
          console.error('No trailer or relevant video found for this media.');
          alert('No trailer or video available for this TV show.');
        }
      },
      (error) => {
        console.error('Error fetching YouTube video:', error);
      }
    );
  }
}
