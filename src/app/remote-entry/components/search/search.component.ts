import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MovieService } from '../../../services/movie.service';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  imports: [CommonModule, RouterModule],
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  searchResults: any[] = [];
  query: string = '';
  private readonly _movieService = inject(MovieService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.query = params['query'];
      if (this.query) {
        this.performSearch(this.query);
      }
    });
  }

  performSearch(query: string): void {
    this._movieService
      .search(query, 1)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response: any) => {
          this.searchResults = response.results.map((item: any) => {
            return {
              link:
                item.media_type === 'movie'
                  ? `/movie/${item.id}`
                  : item.media_type === 'tv'
                  ? `/tv/${item.id}`
                  : `/person/${item.id}`,
              imgSrc: item.poster_path
                ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}`
                : '',
              title: item.title || item.name,
              rating: item.vote_average ? item.vote_average * 10 : 'N/A',
              vote: item.vote_average ? item.vote_average : 'N/A',
              poster_path: item.poster_path,
            };
          });
        },
        (error) => {
          console.error('Search failed', error);
        }
      );
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
