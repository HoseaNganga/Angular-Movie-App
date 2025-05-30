import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MovieCategoryComponent } from './movie-category.component';
import { MovieService } from '../../../services/movie.service';
import { CommonModule } from '@angular/common';
import { ListingComponent } from '../global/listing/listing.component';
import { of, Subject, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('MovieCategoryComponent', () => {
  let component: MovieCategoryComponent;
  let fixture: ComponentFixture<MovieCategoryComponent>;
  let movieService: MovieService;
  let spinnerService: NgxSpinnerService;
  let route: ActivatedRoute;

  // Mock services
  const mockSpinnerService = {
    show: jest.fn(),
    hide: jest.fn(),
  };

  const mockActivatedRoute = {
    url: of([{ path: 'movie' }, { path: 'category' }, { path: 'popular' }]),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ListingComponent, MovieCategoryComponent],
      providers: [
        { provide: MovieService, useValue: { getCategory: jest.fn() } },
        { provide: NgxSpinnerService, useValue: mockSpinnerService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCategoryComponent);
    component = fixture.componentInstance;
    movieService = TestBed.inject(MovieService);
    spinnerService = TestBed.inject(NgxSpinnerService);
    route = TestBed.inject(ActivatedRoute);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show spinner, set category from route, load movies, and hide spinner after 2 seconds', fakeAsync(() => {
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(of({ results: [] }));
    jest.spyOn(component, 'loadCategoryMovies');
    jest.spyOn(global, 'setTimeout').mockImplementation((cb) => {
      cb();
      return 0 as any;
    });

    component.ngOnInit();
    tick(2000);

    expect(spinnerService.show).toHaveBeenCalled();
    expect(component.category).toBe('popular');
    expect(component.loadCategoryMovies).toHaveBeenCalledWith('popular');
    expect(spinnerService.hide).toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
  }));

  it('should emit on destroy$, complete, hide spinner, and reset isLoading in ngOnDestroy', () => {
    const destroySpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
    expect(spinnerService.hide).toHaveBeenCalled();
    expect(component.isLoading).toBe(false);
  });

  it('should call fetchMovies with correct category and property in loadCategoryMovies', () => {
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(of({ results: [] }));
    jest.spyOn(component, 'fetchMovies');
    component.category = 'popular';

    component.loadCategoryMovies('popular');

    expect(component.fetchMovies).toHaveBeenCalledWith(
      'popular',
      'popularMovies'
    );
  });

  it('should fetch movies, update movieCategories, increment page, and reset isLoading', fakeAsync(() => {
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

    component.page = 1;
    component.isLoading = false;
    component.fetchMovies('popular', 'popularMovies');
    tick();

    expect(movieService.getCategory).toHaveBeenCalledWith(
      'popular',
      1,
      'movie'
    );
    expect(component.movieCategories['popularMovies']).toEqual([
      {
        link: '/movie/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster1.jpg',
        title: 'Movie 1',
        rating: 75,
        vote: 7.5,
      },
    ]);
    expect(component.page).toBe(2);
    expect(component.isLoading).toBe(false);
    expect(console.error).not.toHaveBeenCalled();
  }));

  it('should handle error when fetching movies, reset isLoading, and log error', fakeAsync(() => {
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(throwError(() => new Error('API Error')));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    component.isLoading = false;
    component.fetchMovies('popular', 'popularMovies');
    tick();

    expect(movieService.getCategory).toHaveBeenCalledWith(
      'popular',
      1,
      'movie'
    );
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching popular movies:',
      expect.any(Error)
    );
    expect(component.isLoading).toBe(false);
    expect(component.movieCategories['popularMovies']).toEqual([]);
  }));

  it('should not fetch movies if isLoading is true', () => {
    jest.spyOn(movieService, 'getCategory');
    component.isLoading = true;

    component.fetchMovies('popular', 'popularMovies');

    expect(movieService.getCategory).not.toHaveBeenCalled();
  });

  it('should unsubscribe from fetchMovies when destroy$ emits', fakeAsync(() => {
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
    tick();

    expect(component.movieCategories['popularMovies']).toEqual([
      {
        link: '/movie/1',
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
    tick();

    expect(component.movieCategories['popularMovies']).toEqual([]);
  }));

  it('should return correct category property for getCategoryProperty', () => {
    expect(component.getCategoryProperty('popular')).toBe('popularMovies');
    expect(component.getCategoryProperty('top_rated')).toBe('topRatedMovies');
    expect(component.getCategoryProperty('upcoming')).toBe('upcomingMovies');
    expect(component.getCategoryProperty('now_playing')).toBe(
      'nowPlayingMovies'
    );
    expect(component.getCategoryProperty('unknown')).toBe('');
  });

  it('should load more movies on scroll when near bottom', fakeAsync(() => {
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(of({ results: [] }));
    jest.spyOn(component, 'loadCategoryMovies');
    component.category = 'popular';

    // Mock scroll position
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

    component.onScroll(new Event('scroll'));
    tick();

    expect(component.loadCategoryMovies).toHaveBeenCalledWith('popular');
  }));

  it('should not load more movies on scroll if not near bottom', fakeAsync(() => {
    jest.spyOn(component, 'loadCategoryMovies');
    component.category = 'popular';

    // Mock scroll position (not near bottom)
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 500,
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

    component.onScroll(new Event('scroll'));
    tick();

    expect(component.loadCategoryMovies).not.toHaveBeenCalled();
  }));

  it('should render ListingComponent for popular category with correct inputs', fakeAsync(() => {
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(of({ results: [] }));
    component.category = 'popular';
    const mockMovies = [
      {
        link: '/movie/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster1.jpg',
        title: 'Movie 1',
        rating: 75,
        vote: 7.5,
      },
    ];
    component.movieCategories['popularMovies'] = mockMovies;

    fixture.detectChanges();
    tick(2000); // Account for 2000ms setTimeout in ngOnInit

    const listingDebugElement = fixture.debugElement.query(
      By.css('app-listing')
    );
    expect(listingDebugElement).toBeTruthy();
    expect(listingDebugElement.componentInstance.title).toBe('Popular Movies');
    expect(listingDebugElement.componentInstance.items).toEqual(mockMovies);
    expect(
      fixture.nativeElement.querySelector('.infinite-scroll-loading')
    ).toBeNull();
  }));

  it('should render loading SVG when isLoading is true', fakeAsync(() => {
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(of({ results: [] }));
    component.category = 'popular';
    component.isLoading = true;

    fixture.detectChanges();
    tick(2000); // Account for 2000ms setTimeout in ngOnInit

    const loadingSvg = fixture.nativeElement.querySelector(
      '.infinite-scroll-loading svg'
    );
    expect(loadingSvg).toBeTruthy();
    const listingDebugElement = fixture.debugElement.query(
      By.css('app-listing')
    );
    expect(listingDebugElement).toBeTruthy();
  }));
});
