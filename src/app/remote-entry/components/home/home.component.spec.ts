import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HomeComponent } from './home.component';
import { MovieService } from '../../../services/movie.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SliderComponent } from '../global/slider/slider.component';
import { CarouselComponent } from '../global/carousel/carousel.component';
import { of, Subject, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let movieService: MovieService;
  let spinnerService: NgxSpinnerService;

  // Mock services
  const mockSpinnerService = {
    show: jest.fn(),
    hide: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        SliderComponent,
        CarouselComponent,
        HomeComponent,
      ],

      providers: [
        MovieService,
        { provide: NgxSpinnerService, useValue: mockSpinnerService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    movieService = TestBed.inject(MovieService);
    spinnerService = TestBed.inject(NgxSpinnerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show spinner and call data fetching methods on ngOnInit', fakeAsync(() => {
    jest.spyOn(component, 'getNowPlaying');
    jest.spyOn(component, 'getTrending');
    jest.spyOn(global, 'setTimeout').mockImplementation((cb) => {
      cb();
      return 0 as any;
    });

    component.ngOnInit();
    tick(4000);

    expect(spinnerService.show).toHaveBeenCalled();
    expect(component.getNowPlaying).toHaveBeenCalledWith('movie', 1);
    expect(component.getTrending).toHaveBeenCalledWith('movie', 1, 'movies');
    expect(component.getTrending).toHaveBeenCalledWith('tv', 1, 'tvShows');
    expect(spinnerService.hide).toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4000);
  }));

  it('should emit on destroy$ and complete on ngOnDestroy', () => {
    const destroySpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should fetch now playing movies and update slider_data', fakeAsync(() => {
    const mockResponse = {
      results: [
        { id: 1, title: 'Movie 1' },
        { id: 2, title: 'Movie 2' },
      ],
    };
    const mockVideoResponse = {
      results: [{ site: 'YouTube', type: 'Trailer', key: 'abc123' }],
    };

    jest.spyOn(movieService, 'getNowPlaying').mockReturnValue(of(mockResponse));
    jest
      .spyOn(movieService, 'getYouTubeTrailer')
      .mockReturnValue(of(mockVideoResponse));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    component.getNowPlaying('movie', 1);
    tick(2000);

    expect(movieService.getNowPlaying).toHaveBeenCalledWith('movie', 1);
    expect(movieService.getYouTubeTrailer).toHaveBeenCalledTimes(2);
    expect(movieService.getYouTubeTrailer).toHaveBeenCalledWith(1, 'movie');
    expect(movieService.getYouTubeTrailer).toHaveBeenCalledWith(2, 'movie');
    expect(component.slider_data).toEqual([
      { id: 1, title: 'Movie 1', link: '/movie/1', videoId: 'abc123' },
      { id: 2, title: 'Movie 2', link: '/movie/2', videoId: 'abc123' },
    ]);
    expect(console.error).not.toHaveBeenCalled();
  }));

  it('should handle error when fetching now playing movies', fakeAsync(() => {
    jest
      .spyOn(movieService, 'getNowPlaying')
      .mockReturnValue(throwError(() => new Error('API Error')));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    component.getNowPlaying('movie', 1);
    tick(2000); // Account for the 2000ms delay in getNowPlaying

    expect(console.error).toHaveBeenCalledWith(
      'Error fetching now playing data',
      expect.any(Error)
    );
  }));

  it('should unsubscribe from getNowPlaying when destroy$ emits', fakeAsync(() => {
    const mockResponse = { results: [{ id: 1, title: 'Movie 1' }] };
    const mockVideoResponse = {
      results: [{ site: 'YouTube', type: 'Trailer', key: 'abc123' }],
    };

    const subject = new Subject<any>();
    jest
      .spyOn(movieService, 'getNowPlaying')
      .mockReturnValue(subject.asObservable());
    jest
      .spyOn(movieService, 'getYouTubeTrailer')
      .mockReturnValue(of(mockVideoResponse));

    component.getNowPlaying('movie', 1);

    subject.next(mockResponse);
    tick(2000);

    expect(component.slider_data).toEqual([
      { id: 1, title: 'Movie 1', link: '/movie/1', videoId: 'abc123' },
    ]);

    component.slider_data = [];
    component.ngOnDestroy();

    subject.next({ results: [{ id: 2, title: 'Movie 2' }] });
    tick(2000);

    expect(component.slider_data).toEqual([]);
  }));

  it('should fetch trending movies and update trendingMovies_slider_data', () => {
    const mockResponse = {
      results: [
        {
          id: 1,
          title: 'Movie 1',
          poster_path: '/poster1.jpg',
          vote_average: 7.5,
        },
        {
          id: 2,
          title: 'Movie 2',
          poster_path: '/poster2.jpg',
          vote_average: 8.0,
        },
      ],
    };

    jest.spyOn(movieService, 'getTrending').mockReturnValue(of(mockResponse));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    component.getTrending('movie', 1, 'movies');

    expect(movieService.getTrending).toHaveBeenCalledWith('movie', 1);
    expect(component.trendingMovies_slider_data).toEqual([
      {
        link: '/movie/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster1.jpg',
        title: 'Movie 1',
        rating: 75,
        vote: 7.5,
      },
      {
        link: '/movie/2',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster2.jpg',
        title: 'Movie 2',
        rating: 80,
        vote: 8.0,
      },
    ]);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should fetch trending TV shows and update trendingTvShows_slider_data', () => {
    const mockResponse = {
      results: [
        {
          id: 1,
          title: 'TV Show 1',
          poster_path: '/poster1.jpg',
          vote_average: 7.5,
        },
      ],
    };

    jest.spyOn(movieService, 'getTrending').mockReturnValue(of(mockResponse));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    component.getTrending('tv', 1, 'tvShows');

    expect(movieService.getTrending).toHaveBeenCalledWith('tv', 1);
    expect(component.trendingTvShows_slider_data).toEqual([
      {
        link: '/tv/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster1.jpg',
        title: 'TV Show 1',
        rating: 75,
        vote: 7.5,
      },
    ]);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle error when fetching trending data', () => {
    jest
      .spyOn(movieService, 'getTrending')
      .mockReturnValue(throwError(() => new Error('API Error')));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    component.getTrending('movie', 1, 'movies');

    expect(console.error).toHaveBeenCalledWith(
      'Error fetching trending movies:',
      expect.any(Error)
    );
  });

  it('should unsubscribe from getTrending when destroy$ emits', () => {
    const mockResponse = {
      results: [
        {
          id: 1,
          title: 'Movie 1',
          poster_path: '/poster1.jpg',
          vote_average: 7.5,
        },
      ],
    };

    const subject = new Subject<any>();
    jest
      .spyOn(movieService, 'getTrending')
      .mockReturnValue(subject.asObservable());

    component.getTrending('movie', 1, 'movies');

    subject.next(mockResponse);

    expect(component.trendingMovies_slider_data).toEqual([
      {
        link: '/movie/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster1.jpg',
        title: 'Movie 1',
        rating: 75,
        vote: 7.5,
      },
    ]);

    component.trendingMovies_slider_data = [];
    component.ngOnDestroy();

    subject.next({
      results: [
        { id: 2, title: 'Movie 2', poster_path: null, vote_average: 8.0 },
      ],
    });

    expect(component.trendingMovies_slider_data).toEqual([]);
  });
});
