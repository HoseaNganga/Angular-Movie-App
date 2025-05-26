import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly _httpClientService = inject(HttpClient);
  private readonly _api_key = '';

  getNowPlaying(): void {
    this._httpClientService
      .get('/api/?language=en-US&page=1')
      .subscribe((res) => {
        console.log(res);
      });
  }
}

/* eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYzkyNmFmMmFhMzQ1MWRlZTk2MGQzYjIxMDJlYmVhYSIsIm5iZiI6MTc0ODI3MDY0NC4wNTYsInN1YiI6IjY4MzQ3ZTM0MDhiNTkwN2NkODczMDIxOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.r2afHRsRlsUmaf0-6XyuwyboeTCAkXlxGGfutbuJlHc */
