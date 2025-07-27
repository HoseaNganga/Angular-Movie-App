import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { EnvironmentService } from '../../environments/environment.service';
import {
  BackdropResponse,
  CastResponse,
  ExternalIds,
  GenreResponse,
  MovieCategoryResponse,
  MovieDetails,
  NowPlayingMovieResponse,
  PersonCreditResponse,
  PersonDetails,
  PersonExternalIds,
  PersonImageResponse,
  TrendingMovie,
  TrendingResponse,
  TrendingTV,
  TVDetails,
  TvSeasonDetails,
  YouTubeTrailerResponse,
} from './model/movie.service.model';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private readonly _httpClientService = inject(HttpClient);
  private readonly _envService = inject(EnvironmentService);
  private readonly _api_key = this._envService.get('apiKey');
  private readonly language = 'en-US';
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  getNowPlaying(
    mediaType: string,
    page: number
  ): Observable<NowPlayingMovieResponse> {
    const params = this.buildParams({ page: page.toString() });
    return this._httpClientService
      .get<NowPlayingMovieResponse>(
        `${this.baseUrl}/${mediaType}/now_playing`,
        { params }
      )
      .pipe(catchError(this.handleError));
  }

  getYouTubeTrailer(
    id: number,
    mediaType: string
  ): Observable<YouTubeTrailerResponse> {
    const params = this.buildParams({});
    return this._httpClientService
      .get<YouTubeTrailerResponse>(
        `${this.baseUrl}/${mediaType}/${id}/videos`,
        { params }
      )
      .pipe(catchError(this.handleError));
  }
  getTrending<T extends TrendingMovie | TrendingTV>(
    media: string,
    page: number
  ): Observable<TrendingResponse<T>> {
    const params = this.buildParams({ page: page.toString() });
    return this._httpClientService
      .get<TrendingResponse<T>>(`${this.baseUrl}/trending/${media}/week`, {
        params,
      })
      .pipe(catchError(this.handleError));
  }

  getCategory<T>(
    category: string,
    page: number,
    mediaType: string
  ): Observable<TrendingResponse<T>> {
    const params = this.buildParams({ page: page.toString() });
    return this._httpClientService
      .get<TrendingResponse<T>>(`${this.baseUrl}/${mediaType}/${category}`, {
        params,
      })
      .pipe(catchError(this.handleError));
  }

  getMovie(id: number, mediaType: string): Observable<MovieDetails> {
    const params = this.buildParams({});
    return this._httpClientService
      .get<MovieDetails>(`${this.baseUrl}/${mediaType}/${id}`, { params })
      .pipe(catchError(this.handleError));
  }

  getExternalId(id: number, mediaType: string): Observable<ExternalIds> {
    const params = this.buildParams({});
    return this._httpClientService
      .get<ExternalIds>(`${this.baseUrl}/${mediaType}/${id}/external_ids`, {
        params,
      })
      .pipe(catchError(this.handleError));
  }

  getBackdrops(id: number, mediaType: string): Observable<BackdropResponse> {
    return this._httpClientService.get<BackdropResponse>(
      `${this.baseUrl}/${mediaType}/${id}/images?api_key=${this._api_key}`
    );
  }

  getCredits(id: number, type: string): Observable<CastResponse> {
    const params = this.buildParams({});
    return this._httpClientService
      .get<CastResponse>(`${this.baseUrl}/${type}/${id}/credits`, { params })
      .pipe(catchError(this.handleError));
  }
  getRecommended<T>(
    id: number,
    page: number,
    mediaType: string
  ): Observable<TrendingResponse<T>> {
    const params = this.buildParams({});
    return this._httpClientService.get<TrendingResponse<T>>(
      `${this.baseUrl}/${mediaType}/${id}/recommendations`,
      { params }
    );
  }
  getTvShows(page: number): Observable<TrendingResponse<TrendingTV>> {
    const params = this.buildParams({ page: page.toString() });
    return this._httpClientService
      .get<TrendingResponse<TrendingTV>>(`${this.baseUrl}/discover/tv`, {
        params,
      })
      .pipe(catchError(this.handleError));
  }
  getTvShow(id: number): Observable<TVDetails> {
    return this._httpClientService
      .get<TVDetails>(`${this.baseUrl}/tv/${id}`, {
        params: this.buildParams({}),
      })
      .pipe(catchError(this.handleError));
  }
  getTvShowEpisodes(id: number, season: number): Observable<TvSeasonDetails> {
    const params = this.buildParams({});
    return this._httpClientService
      .get<TvSeasonDetails>(`${this.baseUrl}/tv/${id}/season/${season}`, {
        params,
      })
      .pipe(catchError(this.handleError));
  }

  getPerson(id: number): Observable<PersonDetails> {
    const params = this.buildParams({});
    return this._httpClientService
      .get<PersonDetails>(`${this.baseUrl}/person/${id}`, { params })
      .pipe(catchError(this.handleError));
  }
  getPersonImages(id: number): Observable<PersonImageResponse> {
    const params = this.buildParams({});
    return this._httpClientService
      .get<PersonImageResponse>(`${this.baseUrl}/person/${id}/images`, {
        params,
      })
      .pipe(catchError(this.handleError));
  }

  getPersonCredit(id: number): Observable<PersonCreditResponse> {
    const params = this.buildParams({});
    return this._httpClientService
      .get<PersonCreditResponse>(`${this.baseUrl}/person/${id}/movie_credits`, {
        params,
      })
      .pipe(catchError(this.handleError));
  }

  getPersonExternalId(id: number): Observable<PersonExternalIds> {
    return this._httpClientService
      .get<PersonExternalIds>(`${this.baseUrl}/person/${id}/external_ids`, {
        params: this.buildParams({}),
      })
      .pipe(catchError(this.handleError));
  }

  getMovieGenres(): Observable<GenreResponse> {
    return this._httpClientService
      .get<GenreResponse>(`${this.baseUrl}/genre/movie/list?language=en`)
      .pipe(catchError(this.handleError));
  }
  getTvGenres(): Observable<GenreResponse> {
    return this._httpClientService
      .get<GenreResponse>(`${this.baseUrl}/genre/tv/list?language=en`)
      .pipe(catchError(this.handleError));
  }

  getGenreById<T>(
    id: number,
    type: string,
    page: number
  ): Observable<TrendingResponse<T>> {
    const params = this.buildParams({
      with_genres: id,
      language: 'en',
      page: page.toString(),
    });
    return this._httpClientService
      .get<TrendingResponse<T>>(`${this.baseUrl}/discover/${type}?`, { params })
      .pipe(catchError(this.handleError));
  }
  search(
    query: string,
    page: number
  ): Observable<TrendingResponse<TrendingMovie | TrendingTV>> {
    const params = this.buildParams({ query, page: page.toString() });
    return this._httpClientService
      .get<TrendingResponse<TrendingMovie | TrendingTV>>(
        `${this.baseUrl}/search/multi`,
        { params }
      )
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
