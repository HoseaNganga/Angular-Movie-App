import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { MovieService } from '../../../services/movie.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { of, throwError } from 'rxjs';
import { SliderComponent } from '../global/slider/slider.component';
import { CarouselComponent } from '../global/carousel/carousel.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let movieService: jest.Mocked<MovieService>;
  let spinnerService: jest.Mocked<NgxSpinnerService>;

  const mockMovieService = {
    getNowPlaying: jest.fn(),
    getYouTubeTrailer: jest.fn(),
    getTrending: jest.fn(),
  };

  const mockSpinnerService = {
    show: jest.fn(),
    hide: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, SliderComponent, CarouselComponent],
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: NgxSpinnerService, useValue: mockSpinnerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    movieService = TestBed.inject(MovieService) as jest.Mocked<MovieService>;
    spinnerService = TestBed.inject(
      NgxSpinnerService
    ) as jest.Mocked<NgxSpinnerService>;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with empty slider data arrays', () => {
      expect(component.slider_data).toEqual([]);
      expect(component.trendingMovies_slider_data).toEqual([]);
      expect(component.trendingTvShows_slider_data).toEqual([]);
    });

    it('should call show spinner and fetch data on ngOnInit', () => {
      const mockNowPlayingResponse = { results: [{ id: 1, title: 'Movie 1' }] };
      const mockTrendingMoviesResponse = {
        results: [
          {
            id: 2,
            title: 'Movie 2',
            poster_path: '/path2.jpg',
            vote_average: 7.5,
          },
        ],
      };
      const mockTrendingTvResponse = {
        results: [
          {
            id: 3,
            title: 'TV 1',
            poster_path: '/path3.jpg',
            vote_average: 8.0,
          },
        ],
      };

      movieService.getNowPlaying.mockReturnValue(of(mockNowPlayingResponse));
      movieService.getYouTubeTrailer.mockReturnValue(
        of({ results: [{ site: 'YouTube', type: 'Trailer', key: 'abc123' }] })
      );
      movieService.getTrending.mockImplementation((media) =>
        media === 'movie'
          ? of(mockTrendingMoviesResponse)
          : of(mockTrendingTvResponse)
      );

      component.ngOnInit();

      expect(spinnerService.show).toHaveBeenCalled();
      expect(movieService.getNowPlaying).toHaveBeenCalledWith('movie', 1);
      expect(movieService.getTrending).toHaveBeenCalledWith('movie', 1);
      expect(movieService.getTrending).toHaveBeenCalledWith('tv', 1);
    });

    it('should hide spinner after 4 seconds', (done) => {
      jest.useFakeTimers();
      component.ngOnInit();
      jest.advanceTimersByTime(4000);
      expect(spinnerService.hide).toHaveBeenCalled();
      jest.useRealTimers();
      done();
    });
  });

  describe('getNowPlaying', () => {
    it('should fetch now playing movies and map results to slider_data', () => {
      const mockResponse = {
        results: [
          { id: 1, title: 'Movie 1' },
          { id: 2, title: 'Movie 2' },
        ],
      };
      const mockTrailerResponse = {
        results: [{ site: 'YouTube', type: 'Trailer', key: 'abc123' }],
      };
      movieService.getNowPlaying.mockReturnValue(of(mockResponse));
      movieService.getYouTubeTrailer.mockReturnValue(of(mockTrailerResponse));

      component.getNowPlaying('movie', 1);

      expect(movieService.getNowPlaying).toHaveBeenCalledWith('movie', 1);
      expect(component.slider_data).toEqual([
        { id: 1, title: 'Movie 1', link: '/movie/1', videoId: 'abc123' },
        { id: 2, title: 'Movie 2', link: '/movie/2', videoId: 'abc123' },
      ]);
      expect(movieService.getYouTubeTrailer).toHaveBeenCalledTimes(2);
      expect(movieService.getYouTubeTrailer).toHaveBeenCalledWith(1, 'movie');
      expect(movieService.getYouTubeTrailer).toHaveBeenCalledWith(2, 'movie');
    });

    it('should handle empty now playing response', () => {
      const mockResponse = { results: [] };
      movieService.getNowPlaying.mockReturnValue(of(mockResponse));

      component.getNowPlaying('movie', 1);

      expect(component.slider_data).toEqual([]);
      expect(movieService.getYouTubeTrailer).not.toHaveBeenCalled();
    });

    it('should log error on getNowPlaying failure', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('API Error');
      movieService.getNowPlaying.mockReturnValue(throwError(() => error));

      component.getNowPlaying('movie', 1);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching now playing data',
        error
      );
      expect(component.slider_data).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getTrending', () => {
    it('should fetch trending movies and map to trendingMovies_slider_data', () => {
      const mockResponse = {
        results: [
          {
            id: 1,
            title: 'Movie 1',
            poster_path: '/path1.jpg',
            vote_average: 7.5,
          },
        ],
      };
      movieService.getTrending.mockReturnValue(of(mockResponse));

      component.getTrending('movie', 1, 'movies');

      expect(movieService.getTrending).toHaveBeenCalledWith('movie', 1);
      expect(component.trendingMovies_slider_data).toEqual([
        {
          link: '/movie/1',
          imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/path1.jpg',
          title: 'Movie 1',
          rating: 75,
          vote: 7.5,
        },
      ]);
      expect(component.trendingTvShows_slider_data).toEqual([]);
    });

    it('should fetch trending TV shows and map to trendingTvShows_slider_data', () => {
      const mockResponse = {
        results: [
          {
            id: 2,
            title: 'TV 1',
            poster_path: '/path2.jpg',
            vote_average: 8.0,
          },
        ],
      };
      movieService.getTrending.mockReturnValue(of(mockResponse));

      component.getTrending('tv', 1, 'tvShows');

      expect(movieService.getTrending).toHaveBeenCalledWith('tv', 1);
      expect(component.trendingTvShows_slider_data).toEqual([
        {
          link: '/tv/2',
          imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/path2.jpg',
          title: 'TV 1',
          rating: 80,
          vote: 8.0,
        },
      ]);
      expect(component.trendingMovies_slider_data).toEqual([]);
    });

    it('should handle empty trending response', () => {
      const mockResponse = { results: [] };
      movieService.getTrending.mockReturnValue(of(mockResponse));

      component.getTrending('movie', 1, 'movies');

      expect(component.trendingMovies_slider_data).toEqual([]);
      expect(component.trendingTvShows_slider_data).toEqual([]);
    });

    it('should log error on getTrending failure', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('API Error');
      movieService.getTrending.mockReturnValue(throwError(() => error));

      component.getTrending('movie', 1, 'movies');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching trending movies:',
        error
      );
      expect(component.trendingMovies_slider_data).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });
});
