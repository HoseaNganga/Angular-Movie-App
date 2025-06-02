import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { GenreComponent } from './genre.component';
import { MovieService } from '../../../services/movie.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ListingComponent } from '../global/listing/listing.component';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('GenreComponent', () => {
  let component: GenreComponent;
  let fixture: ComponentFixture<GenreComponent>;
  let movieService: jest.Mocked<MovieService>;
  let spinnerService: jest.Mocked<NgxSpinnerService>;

  const mockMovieGenres = {
    genres: [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
    ],
  };

  const mockTvGenres = {
    genres: [{ id: 10759, name: 'Action & Adventure' }],
  };

  const mockGenreData = {
    results: [
      {
        id: 1,
        poster_path: '/poster.jpg',
        title: 'Test Movie',
        vote_average: 7.5,
      },
    ],
  };

  beforeEach(async () => {
    const movieServiceMock = {
      getMovieGenres: jest.fn().mockReturnValue(of(mockMovieGenres)),
      getTvGenres: jest.fn().mockReturnValue(of(mockTvGenres)),
      getGenreById: jest.fn().mockReturnValue(of(mockGenreData)),
    };

    const spinnerServiceMock = {
      show: jest.fn(),
      hide: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, ListingComponent, GenreComponent],
      providers: [
        { provide: MovieService, useValue: movieServiceMock },
        { provide: NgxSpinnerService, useValue: spinnerServiceMock },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GenreComponent);
    component = fixture.componentInstance;
    movieService = TestBed.inject(MovieService) as jest.Mocked<MovieService>;
    spinnerService = TestBed.inject(
      NgxSpinnerService
    ) as jest.Mocked<NgxSpinnerService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values and call genre services', fakeAsync(() => {
    jest.clearAllMocks();

    fixture.detectChanges();

    expect(spinnerService.show).toHaveBeenCalled();
    expect(movieService.getMovieGenres).toHaveBeenCalled();
    expect(movieService.getTvGenres).toHaveBeenCalled();
    expect(movieService.getGenreById).toHaveBeenCalledWith(28, 'movie', 1);
    expect(component.movieGenreList).toEqual(mockMovieGenres.genres);
    expect(component.tvShowsGenreList).toEqual(mockTvGenres.genres);
    expect(component.genre_data).toEqual([
      {
        link: '/movie/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster.jpg',
        title: 'Test Movie',
        rating: 75,
        vote: 7.5,
      },
    ]);

    // Advance timer and complete all pending microtasks
    tick(2000);
    flush();
  }));

  it('should fetch movie genres and update movieGenreList', () => {
    component.getMovieGenres();
    expect(movieService.getMovieGenres).toHaveBeenCalled();
    expect(component.movieGenreList).toEqual(mockMovieGenres.genres);
  });

  it('should fetch TV genres and update tvShowsGenreList', () => {
    component.getTvShowsGenres();
    expect(movieService.getTvGenres).toHaveBeenCalled();
    expect(component.tvShowsGenreList).toEqual(mockTvGenres.genres);
  });

  it('should fetch genre data and append to genre_data', () => {
    component.getGenreById(28, 'movie', 1);
    expect(movieService.getGenreById).toHaveBeenCalledWith(28, 'movie', 1);
    expect(component.genre_data).toEqual([
      {
        link: '/movie/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster.jpg',
        title: 'Test Movie',
        rating: 75,
        vote: 7.5,
      },
    ]);
    expect(component.page).toBe(2);
    expect(component.isLoading).toBe(false);
  });

  it('should handle error and reset isLoading in getGenreById', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    movieService.getGenreById.mockReturnValueOnce(
      throwError(() => new Error('API Error'))
    );

    component.getGenreById(28, 'movie', 1);

    expect(movieService.getGenreById).toHaveBeenCalledWith(28, 'movie', 1);
    expect(component.isLoading).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('should not fetch if isLoading is true in getGenreById', () => {
    component.isLoading = true;
    component.getGenreById(28, 'movie', 1);
    expect(movieService.getGenreById).not.toHaveBeenCalled();
  });

  it('should reset data and fetch new genre data on genre change', fakeAsync(() => {
    const event = { target: { value: '12' } };
    component.onGenreChange(event, 'movie');
    tick(1000); // Simulate setTimeout for spinner

    expect(spinnerService.show).toHaveBeenCalled();
    expect(component.page).toBe(2); // Page increments after getGenreById
    expect(component.genre_data).toEqual([
      {
        link: '/movie/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster.jpg',
        title: 'Test Movie',
        rating: 75,
        vote: 7.5,
      },
    ]);
    expect(component.defaultMediaType).toBe('movie');
    expect(component.defaultId).toBe(12);
    expect(movieService.getGenreById).toHaveBeenCalledWith(12, 'movie', 1);
    expect(spinnerService.hide).toHaveBeenCalled();
  }));

  it('should fetch more data when scrolled to bottom', () => {
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 900,
      writable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 1000,
      writable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: 100,
      writable: true,
    });

    component.onScroll();

    expect(movieService.getGenreById).toHaveBeenCalledWith(28, 'movie', 1);
  });

  it('should not fetch more data when not at bottom', () => {
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 100,
      writable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 1000,
      writable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: 100,
      writable: true,
    });

    component.onScroll();

    expect(movieService.getGenreById).not.toHaveBeenCalled();
  });

  it('should complete destroy$ subject on destroy', () => {
    const destroySpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
