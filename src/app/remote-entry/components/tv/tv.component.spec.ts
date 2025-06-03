import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { TvComponent } from './tv.component';
import { MovieService } from '../../../services/movie.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SliderComponent } from '../global/slider/slider.component';
import { CarouselComponent } from '../global/carousel/carousel.component';
import { RouterModule } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { of, throwError, Subject } from 'rxjs';
import { delay } from 'rxjs/operators';

describe('TvComponent', () => {
  let component: TvComponent;
  let fixture: ComponentFixture<TvComponent>;
  let movieService: MovieService;
  let spinnerService: NgxSpinnerService;

  // Mock services
  const mockSpinnerService = {
    show: jest.fn(),
    hide: jest.fn(),
  };

  const mockMovieService = {
    getTvShows: jest.fn().mockReturnValue(
      of({
        results: [
          { id: 1, name: 'TV Show 1' },
          { id: 2, name: 'TV Show 2' },
        ],
      }).pipe(delay(2000))
    ),
    getYouTubeTrailer: jest.fn().mockReturnValue(
      of({
        results: [{ site: 'YouTube', type: 'Trailer', key: 'trailer_key' }],
      })
    ),
    getCategory: jest.fn().mockReturnValue(
      of({
        results: [
          {
            id: 1,
            poster_path: '/poster.jpg',
            name: 'TV Show',
            vote_average: 8.5,
          },
        ],
      })
    ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        SliderComponent,
        CarouselComponent,
        TvComponent,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: NgxSpinnerService, useValue: mockSpinnerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TvComponent);
    component = fixture.componentInstance;
    movieService = TestBed.inject(MovieService);
    spinnerService = TestBed.inject(NgxSpinnerService);
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show spinner, call getTvDiscover and loadMovies, and hide spinner after 4 seconds', fakeAsync(() => {
    jest.spyOn(movieService, 'getTvShows').mockReturnValue(of({ results: [] }));
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(of({ results: [] }));
    jest.spyOn(component, 'getTvDiscover');
    jest.spyOn(component, 'loadMovies');
    jest.spyOn(global, 'setTimeout').mockImplementation((cb) => {
      cb();
      return 0 as any;
    });

    component.ngOnInit();
    tick(4000);

    expect(spinnerService.show).toHaveBeenCalled();
    expect(component.getTvDiscover).toHaveBeenCalledWith(1);
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

  it('should handle error when fetching TV shows', fakeAsync(() => {
    jest
      .spyOn(movieService, 'getTvShows')
      .mockReturnValue(throwError(() => new Error('API Error')));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    component.getTvDiscover(1);
    tick(2000);

    expect(movieService.getTvShows).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching TV discover data',
      expect.any(Error)
    );
    expect(component.tv_data).toEqual([]);
  }));

  it('should call fetchMovies for all categories in loadMovies', () => {
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(of({ results: [] }));
    jest.spyOn(component, 'fetchMovies');

    component.loadMovies();

    expect(component.fetchMovies).toHaveBeenCalledTimes(4);
    expect(component.fetchMovies).toHaveBeenCalledWith('popular', 'popularTv');
    expect(component.fetchMovies).toHaveBeenCalledWith(
      'top_rated',
      'topRatedTv'
    );
    expect(component.fetchMovies).toHaveBeenCalledWith(
      'on_the_air',
      'onTheAirTv'
    );
    expect(component.fetchMovies).toHaveBeenCalledWith(
      'airing_today',
      'airingTodayTv'
    );
  });

  it('should fetch TV shows for a category and update tvCategories', () => {
    const mockResponse = {
      results: [
        {
          id: 1,
          poster_path: '/poster.jpg',
          name: 'TV Show',
          vote_average: 8.5,
        },
      ],
    };
    jest.spyOn(movieService, 'getCategory').mockReturnValue(of(mockResponse));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    component.fetchMovies('popular', 'popularTv');

    expect(movieService.getCategory).toHaveBeenCalledWith('popular', 1, 'tv');
    expect(component.tvCategories['popularTv']).toEqual([
      {
        link: '/tv/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster.jpg',
        title: 'TV Show',
        rating: 85,
        vote: 8.5,
      },
    ]);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should handle error when fetching TV shows for a category', () => {
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(throwError(() => new Error('API Error')));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    component.fetchMovies('popular', 'popularTv');

    expect(movieService.getCategory).toHaveBeenCalledWith('popular', 1, 'tv');
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching popular movies:',
      expect.any(Error)
    );
    expect(component.tvCategories['popularTv']).toEqual([]);
  });

  it('should unsubscribe from fetchMovies when destroy$ emits', () => {
    const mockResponse = {
      results: [
        {
          id: 1,
          poster_path: '/poster.jpg',
          name: 'TV Show',
          vote_average: 8.5,
        },
      ],
    };
    const subject = new Subject<any>();
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(subject.asObservable());

    component.fetchMovies('popular', 'popularTv');
    subject.next(mockResponse);

    expect(component.tvCategories['popularTv']).toEqual([
      {
        link: '/tv/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster.jpg',
        title: 'TV Show',
        rating: 85,
        vote: 8.5,
      },
    ]);

    component.tvCategories['popularTv'] = [];
    component.ngOnDestroy();
    subject.next({
      results: [
        { id: 2, poster_path: null, name: 'TV Show 2', vote_average: 9.0 },
      ],
    });

    expect(component.tvCategories['popularTv']).toEqual([]);
  });
});
