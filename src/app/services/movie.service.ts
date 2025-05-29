import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly _httpClientService = inject(HttpClient);
  private readonly _api_key = environment.apiKey;
  private readonly language = 'en-US';

  getNowPlaying(mediaType: string, page: number): Observable<any> {
    const params = this.buildParams({ page: page.toString() });
    return this._httpClientService
      .get(`/api/${mediaType}/now_playing`, { params })
      .pipe(catchError(this.handleError));
  }

  getYouTubeTrailer(id: number, mediaType: string): Observable<any> {
    const params = this.buildParams({});
    return this._httpClientService
      .get(`/api/${mediaType}/${id}/videos`, { params })
      .pipe(catchError(this.handleError));
  }
  getTrending(media: string, page: number): Observable<any> {
    const params = this.buildParams({ page: page.toString() });
    return this._httpClientService
      .get(`/api/trending/${media}/week`, { params })
      .pipe(catchError(this.handleError));
  }

  getCategory(
    category: string,
    page: number,
    mediaType: string
  ): Observable<any> {
    const params = this.buildParams({ page: page.toString() });
    return this._httpClientService
      .get(`/api/${mediaType}/${category}`, { params })
      .pipe(catchError(this.handleError));
  }

  getMovie(id: number, mediaType: string): Observable<any> {
    const params = this.buildParams({});
    return this._httpClientService
      .get(`/api/${mediaType}/${id}`, { params })
      .pipe(catchError(this.handleError));
  }

  getExternalId(id: number, mediaType: string): Observable<any> {
    const params = this.buildParams({});
    return this._httpClientService
      .get(`/api/${mediaType}/${id}/external_ids`, { params })
      .pipe(catchError(this.handleError));
  }

  getBackdrops(id: number, mediaType: string): Observable<any> {
    return this._httpClientService.get(
      `/api/${mediaType}/${id}/images?api_key=${this._api_key}`
    );
  }

  getCredits(id: number, type: string): Observable<any> {
    const params = this.buildParams({});
    return this._httpClientService
      .get(`/api/${type}/${id}/credits`, { params })
      .pipe(catchError(this.handleError));
  }
  getRecommended(id: number, page: number, mediaType: string): Observable<any> {
    const params = this.buildParams({});
    return this._httpClientService.get(
      `/api/${mediaType}/${id}/recommendations`,
      { params }
    );
  }
  getTvShows(page: number): Observable<any> {
    const params = this.buildParams({ page: page.toString() });
    return this._httpClientService
      .get(`/api/discover/tv`, { params })
      .pipe(catchError(this.handleError));
  }
  getTvShow(id: number): Observable<any> {
    return this._httpClientService
      .get(`api/tv/${id}`, { params: this.buildParams({}) })
      .pipe(catchError(this.handleError));
  }
  getTvShowEpisodes(id: number, season: number): Observable<any> {
    const params = this.buildParams({});
    return this._httpClientService
      .get(`api/tv/${id}/season/${season}`, { params })
      .pipe(catchError(this.handleError));
  }
  search(query: string, page: number): Observable<any> {
    const params = this.buildParams({ query, page: page.toString() });
    return this._httpClientService
      .get(`api/search/multi`, { params })
      .pipe(catchError(this.handleError));
  }

  private buildParams(params: any): HttpParams {
    let httpParams = new HttpParams()
      .set('api_key', this._api_key)
      .set('language', this.language);
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        httpParams = httpParams.set(key, params[key]);
      }
    }
    return httpParams;
  }
  private handleError(error: any): Observable<never> {
    console.error('An error occurred', error);
    return throwError(() => new Error('Something went wrong'));
  }
}

/* eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYzkyNmFmMmFhMzQ1MWRlZTk2MGQzYjIxMDJlYmVhYSIsIm5iZiI6MTc0ODI3MDY0NC4wNTYsInN1YiI6IjY4MzQ3ZTM0MDhiNTkwN2NkODczMDIxOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.r2afHRsRlsUmaf0-6XyuwyboeTCAkXlxGGfutbuJlHc */
