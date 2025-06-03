import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { of, throwError } from 'rxjs';
import { MoviesInfoComponent } from './movies-info.component';
import { MovieService } from '../../../services/movie.service';

describe('MoviesInfoComponent', () => {
  let component: MoviesInfoComponent;
  let fixture: ComponentFixture<MoviesInfoComponent>;
  let movieService: jest.Mocked<MovieService>;
  let spinnerService: jest.Mocked<NgxSpinnerService>;

  const mockActivatedRoute = {
    params: of({ id: '123' }),
  };

  const mockMovieService = {
    getMovie: jest.fn(),
    getYouTubeTrailer: jest.fn(),
    getExternalId: jest.fn(),
    getBackdrops: jest.fn(),
    getCredits: jest.fn(),
    getRecommended: jest.fn(),
  };

  const mockSpinnerService = {
    show: jest.fn(),
    hide: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoviesInfoComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MovieService, useValue: mockMovieService },
        { provide: NgxSpinnerService, useValue: mockSpinnerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MoviesInfoComponent);
    component = fixture.componentInstance;
    movieService = TestBed.inject(MovieService) as jest.Mocked<MovieService>;
    spinnerService = TestBed.inject(
      NgxSpinnerService
    ) as jest.Mocked<NgxSpinnerService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.activeTab).toBe('overview');
    expect(component.videos).toEqual([]);
    expect(component.backdrops).toEqual([]);
    expect(component.posters).toEqual([]);
    expect(component.recom_data).toEqual([]);
    expect(component.type).toBe('movie');
  });

  it('should set active tab', () => {
    component.setActiveTab('cast');
    expect(component.activeTab).toBe('cast');
  });

  it('should initialize movie data on ngOnInit', () => {
    const mockMovie = { id: 123, title: 'Test Movie' };
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    movieService.getMovie.mockReturnValue(of(mockMovie));
    movieService.getYouTubeTrailer.mockReturnValue(of({ results: [] }));
    movieService.getExternalId.mockReturnValue(of({}));
    movieService.getBackdrops.mockReturnValue(
      of({ backdrops: [], posters: [] })
    );
    movieService.getCredits.mockReturnValue(of({ cast: [] }));
    movieService.getRecommended.mockReturnValue(of({ results: [] }));

    component.ngOnInit();

    expect(spinnerService.show).toHaveBeenCalled();
    expect(component.id).toBe(123);
    expect(movieService.getMovie).toHaveBeenCalledWith(123, 'movie');
    expect(movieService.getYouTubeTrailer).toHaveBeenCalledWith(123, 'movie');
    expect(movieService.getBackdrops).toHaveBeenCalledWith(123, 'movie');
    expect(movieService.getCredits).toHaveBeenCalledWith(123, 'movie');
    expect(movieService.getRecommended).toHaveBeenCalledWith(123, 1, 'movie');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'No trailer or relevant video found for this movie.'
    );
  });

  it('should handle movie info with video trailer', () => {
    const mockMovie = { id: 123, title: 'Test Movie' };
    const mockVideoResponse = {
      results: [{ site: 'YouTube', type: 'Trailer', key: 'abc123' }],
    };

    movieService.getMovie.mockReturnValue(of(mockMovie));
    movieService.getYouTubeTrailer.mockReturnValue(of(mockVideoResponse));
    movieService.getExternalId.mockReturnValue(of({}));

    component.getMovieInfo(123);

    expect(component.movie_data.videoId).toBe('abc123');
  });

  it('should handle movie info without video trailer', () => {
    const mockMovie = { id: 123, title: 'Test Movie' };
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    movieService.getMovie.mockReturnValue(of(mockMovie));
    movieService.getYouTubeTrailer.mockReturnValue(of({ results: [] }));
    movieService.getExternalId.mockReturnValue(of({}));

    component.getMovieInfo(123);

    expect(consoleSpy).toHaveBeenCalledWith(
      'No trailer or relevant video found for this movie.'
    );
  });

  it('should process backdrops and posters correctly', () => {
    const mockResponse = {
      backdrops: [{ file_path: '/backdrop1.jpg' }],
      posters: [{ file_path: '/poster1.jpg' }],
    };
    movieService.getBackdrops.mockReturnValue(of(mockResponse));

    component.getMoviesBackdrop(123, 'movie');

    expect(component.backdrops).toEqual([{ file_path: '/backdrop1.jpg' }]);
    expect(component.posters).toEqual([
      {
        file_path: '/poster1.jpg',
        full_path: 'https://image.tmdb.org/t/p/w342/poster1.jpg',
      },
    ]);
  });

  it('should process cast data correctly', () => {
    const mockResponse = {
      cast: [
        {
          id: 1,
          name: 'Actor Name',
          character: 'Character Name',
          profile_path: '/actor.jpg',
          popularity: 10.5,
        },
      ],
    };
    movieService.getCredits.mockReturnValue(of(mockResponse));

    component.getMovieCast(123, 'movie');

    expect(component.cast_data).toEqual([
      {
        link: '/person/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/actor.jpg',
        name: 'Actor Name',
        character: 'Character Name',
        popularity: 10.5,
      },
    ]);
  });

  it('should process recommended movies correctly', () => {
    const mockResponse = {
      results: [
        {
          id: 456,
          title: 'Recommended Movie',
          poster_path: '/recommended.jpg',
          vote_average: 8.5,
        },
      ],
    };
    movieService.getRecommended.mockReturnValue(of(mockResponse));

    component.getMovieRecommended(123, 1);

    expect(component.recom_data).toEqual([
      {
        link: '/movie/456',
        imgSrc:
          'https://image.tmdb.org/t/p/w370_and_h556_bestv2/recommended.jpg',
        title: 'Recommended Movie',
        vote: 8.5,
        rating: 85,
      },
    ]);
  });

  it('should handle errors gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    movieService.getCredits.mockReturnValue(
      throwError(() => new Error('API Error'))
    );

    component.getMovieCast(123, 'movie');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching credits data',
      expect.any(Error)
    );
  });

  it('should cleanup on destroy', () => {
    const destroySpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
