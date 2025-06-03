import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MovieService } from '../../../../services/movie.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-episodes',
  templateUrl: './episodes.component.html',
  imports: [FormsModule, CommonModule],
  styleUrl: './episodes.component.scss',
})
export class EpisodesComponent implements OnInit, OnDestroy {
  id!: number;
  episodes_data: any[] = [];
  selectedSeason: number = 1;
  seasons: any[] = [];

  private readonly _movieService = inject(MovieService);
  private readonly router = inject(ActivatedRoute);
  private readonly spinner = inject(NgxSpinnerService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit() {
    this.router.params.subscribe((params: Params) => {
      this.spinner.show();
      this.id = +params['id'];

      this._movieService
        .getTvShow(this.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (result) => {
            this.handleTvInfo(result);
            this.spinner.hide();
          },
          (error) => {
            console.error('Error fetching data', error);
            this.spinner.hide();
          }
        );
    });
  }

  handleTvInfo(result: any) {
    this.seasons = result.seasons.filter(
      (season: any) => season.season_number !== 0
    );

    this.selectedSeason =
      this.seasons.length > 0 ? this.seasons[0].season_number : 1;

    this.loadEpisodes(this.id, this.selectedSeason);
  }

  loadEpisodes(id: number, season: number): void {
    this._movieService
      .getTvShowEpisodes(id, season)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.episodes_data = data.episodes;
        },
        (error) => {
          console.error('Error fetching episodes:', error);
        }
      );
  }

  onSeasonChange(event: any): void {
    const selectedSeason = event.target.value;
    this.loadEpisodes(this.id, selectedSeason);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
