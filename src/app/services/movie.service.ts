import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { EnvironmentService } from '../../environments/environment.service';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly _httpClientService = inject(HttpClient);
  private readonly _envService = inject(EnvironmentService);
  private readonly _api_key = this._envService.get('apiKey');
  private readonly language = 'en-US';
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  getNowPlaying(mediaType: string, page: number): Observable<any> {
    const params = this.buildParams({ page: page.toString() });
    return this._httpClientService
      .get(`${this.baseUrl}/${mediaType}/now_playing`, { params })
      .pipe(catchError(this.handleError));
  }

  getYouTubeTrailer(id: number, mediaType: string): Observable<any> {
    const params = this.buildParams({});
    return this._httpClientService
      .get(`${this.baseUrl}/${mediaType}/${id}/videos`, { params })
      .pipe(catchError(this.handleError));
  }
  getTrending(media: string, page: number): Observable<any> {
    const params = this.buildParams({ page: page.toString() });
    return this._httpClientService
      .get(`${this.baseUrl}/trending/${media}/week`, { params })
      .pipe(catchError(this.handleError));
  }

  getCategory(
    category: string,
    page: number,
    mediaType: string
  ): Observable<any> {
    const params = this.buildParams({ page: page.toString() });
    return this._httpClientService
      .get(`${this.baseUrl}/${mediaType}/${category}`, { params })
      .pipe(catchError(this.handleError));
  }

  getMovie(id: number, mediaType: string): Observable<any> {
    const params = this.buildParams({});
    return this._httpClientService
      .get(`${this.baseUrl}/${mediaType}/${id}`, { params })
      .pipe(catchError(this.handleError));
  }

  getExternalId(id: number, mediaType: string): Observable<any> {
    const params = this.buildParams({});
    return this._httpClientService
      .get(`${this.baseUrl}/${mediaType}/${id}/external_ids`, { params })
      .pipe(catchError(this.handleError));
  }

  getBackdrops(id: number, mediaType: string): Observable<any> {
    return this._httpClientService.get(
      `${this.baseUrl}/${mediaType}/${id}/images?api_key=${this._api_key}`
    );
  }

  getCredits(id: number, type: string): Observable<any> {
    const params = this.buildParams({});
    return this._httpClientService
      .get(`${this.baseUrl}/${type}/${id}/credits`, { params })
      .pipe(catchError(this.handleError));
  }
  getRecommended(id: number, page: number, mediaType: string): Observable<any> {
    const params = this.buildParams({});
    return this._httpClientService.get(
      `${this.baseUrl}/${mediaType}/${id}/recommendations`,
      { params }
    );
  }
  getTvShows(page: number): Observable<any> {
    const params = this.buildParams({ page: page.toString() });
    return this._httpClientService
      .get(`${this.baseUrl}/discover/tv`, { params })
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

  getPerson(id: number): Observable<any> {
    const params = this.buildParams({});
    return this._httpClientService
      .get(`api/person/${id}`, { params })
      .pipe(catchError(this.handleError));
  }
  getPersonImages(id: number): Observable<any> {
    const params = this.buildParams({});
    return this._httpClientService
      .get(`api/person/${id}/images`, { params })
      .pipe(catchError(this.handleError));
  }

  getPersonCredit(id: number): Observable<any> {
    const params = this.buildParams({});
    return this._httpClientService
      .get(`api/person/${id}/movie_credits`, { params })
      .pipe(catchError(this.handleError));
  }

  getPersonExternalId(id: number): Observable<any> {
    return this._httpClientService
      .get(`api/person/${id}/external_ids`, { params: this.buildParams({}) })
      .pipe(catchError(this.handleError));
  }
  getMovieGenres(): Observable<any> {
    return this._httpClientService
      .get(`api/genre/movie/list?language=en`)
      .pipe(catchError(this.handleError));
  }
  getTvGenres(): Observable<any> {
    return this._httpClientService
      .get(`api/genre/tv/list?language=en`)
      .pipe(catchError(this.handleError));
  }

  getGenreById(id: number, type: string, page: number): Observable<any> {
    const params = this.buildParams({
      with_genres: id,
      language: 'en',
      page: page.toString(),
    });
    return this._httpClientService
      .get(`api/discover/${type}?`, { params })
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
