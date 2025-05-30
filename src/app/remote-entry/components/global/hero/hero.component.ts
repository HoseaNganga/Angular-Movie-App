import { Component, Input, OnDestroy, ViewChild, inject } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { MovieService } from '../../../../services/movie.service';
import { CommonModule } from '@angular/common';
import { NumberWithCommasPipe } from '../pipes/NumberWithCommas/numberwithcommas.pipe';
import { TruncatePipe } from '../pipes/Truncate/truncate.pipe';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  imports: [
    CommonModule,
    NumberWithCommasPipe,
    TruncatePipe,
    RouterModule,
    ModalComponent,
  ],
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements OnDestroy {
  @Input() data: any;

  @ViewChild(ModalComponent) modal!: ModalComponent;

  private readonly _movieService = inject(MovieService);
  private readonly destroy$ = new Subject<void>();

  openTrailer() {
    const mediaType = this.data.number_of_seasons ? 'tv' : 'movie';
    this._movieService
      .getYouTubeTrailer(this.data.id, mediaType)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response: any) => {
          const video = response.results.find(
            (vid: any) =>
              vid.site === 'YouTube' &&
              ['Trailer', 'Teaser', 'Clip'].includes(vid.type)
          );
          if (video) {
            const videoUrl = `https://www.youtube.com/embed/${video.key}?rel=0&autoplay=1&mute=1`;
            this.modal.openModal(videoUrl);
          } else {
            console.error('No trailer or relevant video found for this media.');
            alert('No trailer or video available for this media.');
          }
        },
        (error) => {
          console.error('Error fetching YouTube video:', error);
        }
      );
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
