import { Component, inject, OnDestroy } from '@angular/core';
import { MovieService } from '../../../services/movie.service';
import { ActivatedRoute, Params } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaComponent } from '../global/media/media.component';
import { ListingComponent } from '../global/listing/listing.component';
import { ImagesComponent } from '../global/images/images.component';
import { SortByYearPipe } from '../global/pipes/SortByYear/sort-by-year.pipe';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  imports: [
    CommonModule,
    MediaComponent,
    ListingComponent,
    ImagesComponent,
    SortByYearPipe,
  ],
  styleUrl: './person.component.scss',
})
export class PersonComponent implements OnDestroy {
  id!: number;
  person_data: any;
  external_data: any;
  activeTab: string = 'knownfor';
  posters: any;
  knownfor: any;
  posters_data: any[] = [];

  private readonly _movieService = inject(MovieService);
  private readonly router = inject(ActivatedRoute);
  private readonly spinner = inject(NgxSpinnerService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  ngOnInit() {
    this.router.params.subscribe((params: Params) => {
      this.spinner.show();
      this.id = +params['id'];
      this.getPersonDetails(this.id);
      this.getPersonPoster(this.id);
      this.getKnowFor(this.id);
      setTimeout(() => {
        this.spinner.hide();
      }, 2000);
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getPersonDetails(id: number) {
    this._movieService
      .getPerson(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: any) => {
        this.person_data = result;
        this.getPersonalExternal(id);
      });
  }

  getPersonalExternal(id: number) {
    this._movieService
      .getPersonExternalId(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: any) => {
        this.external_data = result;
      });
  }

  getPersonPoster(id: number) {
    this._movieService
      .getPersonImages(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.posters = res.profiles.map((profile: any) => ({
          ...profile,
          full_path: profile.file_path
            ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2/${profile.file_path}`
            : null,
        }));
      });
  }

  getKnowFor(id: number) {
    this._movieService
      .getPersonCredit(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (result: any) => {
          this.knownfor = result.cast.map((item: any) => {
            const releaseDate = item.release_date || item.first_air_date;
            const year = releaseDate
              ? new Date(releaseDate).getFullYear()
              : null;
            return {
              link: `/movie/${item.id}`,
              imgSrc: item.poster_path
                ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}`
                : null,
              title: item.title,
              rating: item.vote_average * 10,
              vote: item.vote_average,
              year: year,
            };
          });
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error fetching credits data', error);
        }
      );
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.spinner.hide();
    this.cdr.detach();
  }
}
