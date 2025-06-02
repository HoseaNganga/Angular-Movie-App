import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MoviesComponent } from './movies.component';
import { MovieService } from '../../../services/movie.service';
import { SliderComponent } from '../global/slider/slider.component';
import { CarouselComponent } from '../global/carousel/carousel.component';
import { RouterModule } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('MoviesComponent', () => {
  let component: MoviesComponent;
  let fixture: ComponentFixture<MoviesComponent>;
  let movieService: MovieService;
  let spinnerService: NgxSpinnerService;

  // Mock services
  const mockSpinnerService = {
    show: jest.fn(),
    hide: jest.fn(),
  };

  const mockActivatedRoute = {
    snapshot: {},
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        SliderComponent,
        CarouselComponent,
        MoviesComponent,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: MovieService,
          useValue: { getNowPlaying: jest.fn(), getCategory: jest.fn() },
        },
        { provide: NgxSpinnerService, useValue: mockSpinnerService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MoviesComponent);
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

  it('should show spinner, call getNowPlaying and loadMovies, and hide spinner after 4 seconds', fakeAsync(() => {
    jest
      .spyOn(movieService, 'getNowPlaying')
      .mockReturnValue(of({ results: [] }));

    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(of({ results: [] }));
    jest.spyOn(component, 'getNowPlaying');
    jest.spyOn(component, 'loadMovies');
    jest.spyOn(global, 'setTimeout').mockImplementation((cb) => {
      cb();
      return 0 as any;
    });

    component.ngOnInit();
    tick(4000);

    expect(spinnerService.show).toHaveBeenCalled();
    expect(component.getNowPlaying).toHaveBeenCalledWith(2);
    expect(component.loadMovies).toHaveBeenCalled();
    expect(spinnerService.hide).toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4000);
  }));

  it('should emit on destroy$ and complete in ngOnDestroy', () => {
    const destroySpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should fetch now playing movies and update movies_data', fakeAsync(() => {
    const mockResponse = {
      results: [
        { id: 1, title: 'Movie 1' },
        { id: 2, title: 'Movie 2' },
      ],
    };
    jest.spyOn(movieService, 'getNowPlaying').mockReturnValue(of(mockResponse));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    component.getNowPlaying(2);
    tick(2000);

    expect(movieService.getNowPlaying).toHaveBeenCalledWith('movie', 2);
    expect(component.movies_data).toEqual([
      { id: 1, title: 'Movie 1', link: '/movie/1' },
      { id: 2, title: 'Movie 2', link: '/movie/2' },
    ]);
    expect(console.error).not.toHaveBeenCalled();
  }));

  it('should handle error when fetching now playing movies', fakeAsync(() => {
    jest
      .spyOn(movieService, 'getNowPlaying')
      .mockReturnValue(throwError(() => new Error('API Error')));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    component.getNowPlaying(2);
    tick(2000);

    expect(movieService.getNowPlaying).toHaveBeenCalledWith('movie', 2);
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching now playing data',
      expect.any(Error)
    );
    expect(component.movies_data).toEqual([]);
  }));

  it('should unsubscribe from getNowPlaying when destroy$ emits', fakeAsync(() => {
    const mockResponse = {
      results: [{ id: 1, title: 'Movie 1' }],
    };
    const subject = new Subject<any>();
    jest
      .spyOn(movieService, 'getNowPlaying')
      .mockReturnValue(subject.asObservable());

    component.getNowPlaying(2);
    subject.next(mockResponse);
    tick(2000);

    expect(component.movies_data).toEqual([
      { id: 1, title: 'Movie 1', link: '/movie/1' },
    ]);

    component.movies_data = [];
    component.ngOnDestroy();
    subject.next({ results: [{ id: 2, title: 'Movie 2' }] });
    tick(2000);

    expect(component.movies_data).toEqual([]);
  }));

  it('should call fetchMovies for all categories in loadMovies', () => {
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(of({ results: [] }));
    jest.spyOn(component, 'fetchMovies');

    component.loadMovies();

    expect(component.fetchMovies).toHaveBeenCalledTimes(4);
    expect(component.fetchMovies).toHaveBeenCalledWith(
      'now_playing',
      'nowPlayingMovies'
    );
    expect(component.fetchMovies).toHaveBeenCalledWith(
      'popular',
      'popularMovies'
    );
    expect(component.fetchMovies).toHaveBeenCalledWith(
      'upcoming',
      'upcomingMovies'
    );
    expect(component.fetchMovies).toHaveBeenCalledWith(
      'top_rated',
      'topRatedMovies'
    );
  });

  it('should fetch movies for a category and update movieCategories', () => {
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
    jest.spyOn(movieService, 'getCategory').mockReturnValue(of(mockResponse));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    component.fetchMovies('popular', 'popularMovies');

    expect(movieService.getCategory).toHaveBeenCalledWith(
      'popular',
      1,
      'movie'
    );
    expect(component.movieCategories['popularMovies']).toEqual([
      {
        link: '/movie/1',
        linkExplorer: '/movie/category/popular',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster1.jpg',
        title: 'Movie 1',
        rating: 75,
        vote: 7.5,
      },
    ]);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle error when fetching movies for a category', () => {
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(throwError(() => new Error('API Error')));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    component.fetchMovies('popular', 'popularMovies');

    expect(movieService.getCategory).toHaveBeenCalledWith(
      'popular',
      1,
      'movie'
    );
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching popular movies:',
      expect.any(Error)
    );
    expect(component.movieCategories['popularMovies']).toEqual([]);
  });

  it('should unsubscribe from fetchMovies when destroy$ emits', () => {
    const mockResponse = {
      results: [
        {
          id: 1,
          title: 'Movie 1',
          poster_path: '/poster1.jpg',
          vote_average: 6.5,
        },
      ],
    };
    const subject = new Subject<any>();
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(subject.asObservable());

    component.fetchMovies('popular', 'popularMovies');
    subject.next(mockResponse);

    expect(component.movieCategories['popularMovies']).toEqual([
      {
        link: '/movie/1',
        linkExplorer: '/movie/category/popular',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster1.jpg',
        title: 'Movie 1',
        rating: 65,
        vote: 6.5,
      },
    ]);

    component.movieCategories['popularMovies'] = [];
    component.ngOnDestroy();
    subject.next({
      results: [
        { id: 2, title: 'Movie 2', poster_path: null, vote_average: 8.0 },
      ],
    });

    expect(component.movieCategories['popularMovies']).toEqual([]);
  });
});
