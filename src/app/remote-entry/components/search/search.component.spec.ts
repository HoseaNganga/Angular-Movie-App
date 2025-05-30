import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchComponent } from './search.component';
import { MovieService } from '../../../services/movie.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of, Subject, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let movieService: jest.Mocked<MovieService>;
  let mockActivatedRoute;

  const mockSearchResponse = {
    results: [
      {
        id: 1,
        media_type: 'movie',
        poster_path: '/test.jpg',
        title: 'Test Movie',
        vote_average: 7.5,
      },
      {
        id: 2,
        media_type: 'tv',
        name: 'Test Show',
        vote_average: 8.0,
      },
    ],
  };

  beforeEach(async () => {
    // Mock MovieService
    const movieServiceMock = {
      search: jest.fn().mockReturnValue(of(mockSearchResponse)),
    };

    // Mock ActivatedRoute
    mockActivatedRoute = {
      queryParams: of({ query: 'test' }),
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterModule, SearchComponent],
      providers: [
        { provide: MovieService, useValue: movieServiceMock },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    movieService = TestBed.inject(MovieService) as jest.Mocked<MovieService>;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with query from route params', () => {
    expect(component.query).toBe('test');
    expect(movieService.search).toHaveBeenCalledWith('test', 1);
  });

  it('should map search results correctly', () => {
    expect(component.searchResults).toEqual([
      {
        link: '/movie/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/test.jpg',
        title: 'Test Movie',
        rating: 75,
        vote: 7.5,
        poster_path: '/test.jpg',
      },
      {
        link: '/tv/2',
        imgSrc: '',
        title: 'Test Show',
        rating: 80,
        vote: 8.0,
        poster_path: undefined,
      },
    ]);
  });

  it('should handle search error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    movieService.search.mockReturnValue(
      throwError(() => new Error('Search failed'))
    );

    component.performSearch('test');
    fixture.detectChanges();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Search failed',
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });

  it('should display search results in template', () => {
    fixture.detectChanges();
    const titleElement = fixture.debugElement.query(By.css('.listing__title'));
    expect(titleElement.nativeElement.textContent).toContain(
      'Search Results for "test"'
    );

    const cards = fixture.debugElement.queryAll(By.css('.card'));
    expect(cards.length).toBe(2);

    const firstCard = cards[0];
    expect(
      firstCard.query(By.css('.card__name')).nativeElement.textContent
    ).toContain('Test Movie');
    expect(
      firstCard.query(By.css('.card__vote')).nativeElement.textContent
    ).toContain('7.5');
    expect(firstCard.query(By.css('img')).nativeElement.src).toContain(
      '/test.jpg'
    );
  });

  it('should show no results message when searchResults is empty', () => {
    component.searchResults = [];
    fixture.detectChanges();

    const noResults = fixture.debugElement.query(By.css('p'));
    expect(noResults.nativeElement.textContent).toContain(
      'No results found for "test"'
    );
  });

  it('should clean up subscriptions on destroy', () => {
    const nextSpy = jest.spyOn(Subject.prototype, 'next');
    const completeSpy = jest.spyOn(Subject.prototype, 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();

    // Clean up spies
    nextSpy.mockRestore();
    completeSpy.mockRestore();
  });

  it('should handle different media types correctly', () => {
    const personResponse = {
      results: [{ id: 3, media_type: 'person', name: 'Test Person' }],
    };
    movieService.search.mockReturnValue(of(personResponse));

    component.performSearch('test');
    fixture.detectChanges();

    expect(component.searchResults[0].link).toBe('/person/3');
    expect(component.searchResults[0].title).toBe('Test Person');
  });

  it('should handle missing vote_average', () => {
    const noRatingResponse = {
      results: [{ id: 4, media_type: 'movie', title: 'No Rating Movie' }],
    };
    movieService.search.mockReturnValue(of(noRatingResponse));

    component.performSearch('test');
    fixture.detectChanges();

    expect(component.searchResults[0].rating).toBe('N/A');
    expect(component.searchResults[0].vote).toBe('N/A');
  });
});
