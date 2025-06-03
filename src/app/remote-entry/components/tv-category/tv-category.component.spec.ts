import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { TvCategoryComponent } from './tv-category.component';
import { MovieService } from '../../../services/movie.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import { ListingComponent } from '../global/listing/listing.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { of, Subject, throwError } from 'rxjs';

describe('TvCategoryComponent', () => {
  let component: TvCategoryComponent;
  let fixture: ComponentFixture<TvCategoryComponent>;
  let movieService: MovieService;
  let spinnerService: NgxSpinnerService;
  let activatedRoute: ActivatedRoute;

  // Mock services
  const mockSpinnerService = {
    show: jest.fn(),
    hide: jest.fn(),
  };

  const mockActivatedRoute = {
    url: new Subject<any>(),
  };

  const mockMovieService = {
    getCategory: jest.fn().mockReturnValue(
      of({
        results: [
          {
            id: 1,
            poster_path: '/poster.jpg',
            name: 'TV Show 1',
            vote_average: 8.5,
          },
        ],
      })
    ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule.forRoot([]),
        ListingComponent,
        TvCategoryComponent,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: NgxSpinnerService, useValue: mockSpinnerService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TvCategoryComponent);
    component = fixture.componentInstance;
    movieService = TestBed.inject(MovieService);
    spinnerService = TestBed.inject(NgxSpinnerService);
    activatedRoute = TestBed.inject(ActivatedRoute);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call fetchTv with correct category and property in loadCategoryTv', () => {
    jest.spyOn(component, 'fetchTv');
    component.category = 'popular';
    component.loadCategoryTv('popular');

    expect(component.fetchTv).toHaveBeenCalledWith('popular', 'popularTv');
  });

  it('should fetch TV shows for a category and update tvCategories', fakeAsync(() => {
    const mockResponse = {
      results: [
        {
          id: 1,
          poster_path: '/poster.jpg',
          name: 'TV Show 1',
          vote_average: 8.5,
        },
      ],
    };
    jest.spyOn(movieService, 'getCategory').mockReturnValue(of(mockResponse));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    component.fetchTv('popular', 'popularTv');
    fixture.detectChanges();
    tick();

    expect(movieService.getCategory).toHaveBeenCalledWith('popular', 1, 'tv');
    expect(component.tvCategories['popularTv']).toEqual([
      {
        link: '/tv/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster.jpg',
        title: 'TV Show 1',
        rating: 85,
        vote: 8.5,
      },
    ]);
    expect(component.isLoading).toBe(false);
    expect(component.page).toBe(2);
    expect(console.error).not.toHaveBeenCalled();
  }));

  it('should handle error when fetching TV shows for a category', fakeAsync(() => {
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(throwError(() => new Error('API Error')));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    component.fetchTv('popular', 'popularTv');
    fixture.detectChanges();
    tick();

    expect(movieService.getCategory).toHaveBeenCalledWith('popular', 1, 'tv');
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching popular tv:',
      expect.any(Error)
    );
    expect(component.tvCategories['popularTv']).toEqual([]);
    expect(component.isLoading).toBe(false);
    expect(component.page).toBe(1);
  }));

  it('should not fetch TV shows if isLoading is true', () => {
    component.isLoading = true;
    jest.spyOn(movieService, 'getCategory');

    component.fetchTv('popular', 'popularTv');

    expect(movieService.getCategory).not.toHaveBeenCalled();
    expect(component.tvCategories['popularTv']).toEqual([]);
  });

  it('should map category to correct property in getCategoryProperty', () => {
    expect(component.getCategoryProperty('popular')).toBe('popularTv');
    expect(component.getCategoryProperty('top_rated')).toBe('topRatedTv');
    expect(component.getCategoryProperty('on_the_air')).toBe('onTheAirTv');
    expect(component.getCategoryProperty('airing_today')).toBe('airingTodayTv');
    expect(component.getCategoryProperty('unknown')).toBe('');
  });

  it('should load more TV shows on scroll when near bottom', fakeAsync(() => {
    jest.spyOn(component, 'loadCategoryTv');
    component.category = 'popular';

    // Simulate scroll position near bottom
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

    expect(component.loadCategoryTv).toHaveBeenCalledWith('popular');
  }));

  it('should not load more TV shows on scroll when not near bottom', fakeAsync(() => {
    jest.spyOn(component, 'loadCategoryTv');
    component.category = 'popular';

    // Simulate scroll position far from bottom
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

    component.onScroll(new Event('scroll'));
    tick();

    expect(component.loadCategoryTv).not.toHaveBeenCalled();
  }));

  it('should render listing component with correct inputs for popular category', fakeAsync(() => {
    const mockCategoryData = [
      {
        link: '/tv/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster.jpg',
        title: 'TV Show 1',
        rating: 85,
        vote: 8.5,
      },
    ];
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(of({ results: [] }));
    component.category = 'popular';
    component.tvCategories['popularTv'] = mockCategoryData;

    const urlSubject = activatedRoute.url as Subject<any>;
    urlSubject.next([{ path: '' }, { path: 'category' }, { path: 'popular' }]);
    fixture.detectChanges();
    tick(2000);

    const listingDebugElement = fixture.debugElement.query(
      By.css('app-listing')
    );
    expect(listingDebugElement).toBeTruthy();
    expect(listingDebugElement.componentInstance.title).toBe(
      'Popular TV Shows'
    );
    expect(listingDebugElement.componentInstance.items).toEqual(
      mockCategoryData
    );
  }));

  it('should render listing component with correct inputs for top_rated category', fakeAsync(() => {
    const mockCategoryData = [
      {
        link: '/tv/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster.jpg',
        title: 'TV Show 1',
        rating: 85,
        vote: 8.5,
      },
    ];
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(of({ results: [] }));
    component.category = 'top_rated';
    component.tvCategories['topRatedTv'] = mockCategoryData;

    const urlSubject = activatedRoute.url as Subject<any>;
    urlSubject.next([
      { path: '' },
      { path: 'category' },
      { path: 'top_rated' },
    ]);
    fixture.detectChanges();
    tick(2000);

    const listingDebugElement = fixture.debugElement.query(
      By.css('app-listing')
    );
    expect(listingDebugElement).toBeTruthy();
    expect(listingDebugElement.componentInstance.title).toBe(
      'Top Rated TV Shows'
    );
    expect(listingDebugElement.componentInstance.items).toEqual(
      mockCategoryData
    );
  }));

  it('should render listing component with correct inputs for on_the_air category', fakeAsync(() => {
    const mockCategoryData = [
      {
        link: '/tv/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster.jpg',
        title: 'TV Show 1',
        rating: 85,
        vote: 8.5,
      },
    ];
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(of({ results: [] }));
    component.category = 'on_the_air';
    component.tvCategories['onTheAirTv'] = mockCategoryData;

    const urlSubject = activatedRoute.url as Subject<any>;
    urlSubject.next([
      { path: '' },
      { path: 'category' },
      { path: 'on_the_air' },
    ]);
    fixture.detectChanges();
    tick(2000);

    const listingDebugElement = fixture.debugElement.query(
      By.css('app-listing')
    );
    expect(listingDebugElement).toBeTruthy();
    expect(listingDebugElement.componentInstance.title).toBe(
      'Currently Airing TV Shows'
    );
    expect(listingDebugElement.componentInstance.items).toEqual(
      mockCategoryData
    );
  }));

  it('should render listing component with correct inputs for airing_today category', fakeAsync(() => {
    const mockCategoryData = [
      {
        link: '/tv/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster.jpg',
        title: 'TV Show 1',
        rating: 85,
        vote: 8.5,
      },
    ];
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(of({ results: [] }));
    component.category = 'airing_today';
    component.tvCategories['airingTodayTv'] = mockCategoryData;

    const urlSubject = activatedRoute.url as Subject<any>;
    urlSubject.next([
      { path: '' },
      { path: 'category' },
      { path: 'airing_today' },
    ]);
    fixture.detectChanges();
    tick(2000);

    const listingDebugElement = fixture.debugElement.query(
      By.css('app-listing')
    );
    expect(listingDebugElement).toBeTruthy();
    expect(listingDebugElement.componentInstance.title).toBe(
      'TV Shows Airing Today'
    );
    expect(listingDebugElement.componentInstance.items).toEqual(
      mockCategoryData
    );
  }));

  it('should render loading spinner when isLoading is true', fakeAsync(() => {
    component.isLoading = true;
    fixture.detectChanges();

    const loadingElement = fixture.debugElement.query(
      By.css('.infinite-scroll-loading')
    );
    expect(loadingElement).toBeTruthy();
    expect(loadingElement.nativeElement.querySelector('svg')).toBeTruthy();
  }));
  it('should unsubscribe from fetchTv when destroy$ emits', fakeAsync(() => {
    const mockResponse = {
      results: [
        {
          id: 1,
          poster_path: '/poster.jpg',
          name: 'TV Show 1',
          vote_average: 8.5,
        },
      ],
    };
    const subject = new Subject<any>();
    jest
      .spyOn(movieService, 'getCategory')
      .mockReturnValue(subject.asObservable());

    component.category = 'popular';
    component.fetchTv('popular', 'popularTv');
    subject.next(mockResponse);
    tick();

    expect(component.tvCategories['popularTv']).toEqual([
      {
        link: '/tv/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster.jpg',
        title: 'TV Show 1',
        rating: 85,
        vote: 8.5,
      },
    ]);

    component.tvCategories['popularTv'] = [];
    component.ngOnDestroy();
    subject.next({
      results: [
        {
          id: 2,
          poster_path: '/poster2.jpg',
          name: 'TV Show 2',
          vote_average: 9.0,
        },
      ],
    });
    tick();

    expect(component.tvCategories['popularTv']).toEqual([]);
  }));
});
