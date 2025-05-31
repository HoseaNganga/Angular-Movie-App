import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { SearchComponent } from './search.component';
import { MovieService } from '../../../services/movie.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let mockMovieService: jest.Mocked<MovieService>;
  let mockActivatedRoute: any;

  const mockSearchResponse = {
    results: [
      {
        id: 1,
        title: 'Movie Title',
        poster_path: '/movie-poster.jpg',
        vote_average: 8.5,
        media_type: 'movie',
      },
      {
        id: 2,
        name: 'TV Show Name',
        poster_path: '/tv-poster.jpg',
        vote_average: 7.2,
        media_type: 'tv',
      },
      {
        id: 3,
        name: 'Person Name',
        poster_path: null,
        vote_average: null,
        media_type: 'person',
      },
      {
        id: 4,
        title: 'Movie Without Rating',
        poster_path: '/movie-poster-2.jpg',
        vote_average: 0,
        media_type: 'movie',
      },
    ],
  };

  beforeEach(async () => {
    mockMovieService = {
      search: jest.fn(),
    } as any;

    mockActivatedRoute = {
      queryParams: of({ query: 'test search' }),
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterModule, SearchComponent],
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.searchResults).toEqual([]);
    expect(component.query).toBe('');
  });

  it('should extract query from route params and perform search on ngOnInit', () => {
    mockMovieService.search.mockReturnValue(of(mockSearchResponse));
    jest.spyOn(component, 'performSearch');

    component.ngOnInit();

    expect(component.query).toBe('test search');
    expect(component.performSearch).toHaveBeenCalledWith('test search');
  });

  it('should not perform search if query is empty', () => {
    mockActivatedRoute.queryParams = of({ query: '' });
    jest.spyOn(component, 'performSearch');

    component.ngOnInit();

    expect(component.query).toBe('');
    expect(component.performSearch).not.toHaveBeenCalled();
  });

  it('should not perform search if query is undefined', () => {
    mockActivatedRoute.queryParams = of({});
    jest.spyOn(component, 'performSearch');

    component.ngOnInit();

    expect(component.query).toBeUndefined();
    expect(component.performSearch).not.toHaveBeenCalled();
  });

  it('should call movie service search with correct parameters', () => {
    mockMovieService.search.mockReturnValue(of(mockSearchResponse));

    component.performSearch('test query');

    expect(mockMovieService.search).toHaveBeenCalledWith('test query', 1);
  });

  it('should transform search results correctly for movies', () => {
    const movieResponse = {
      results: [
        {
          id: 1,
          title: 'Test Movie',
          poster_path: '/test-poster.jpg',
          vote_average: 8.5,
          media_type: 'movie',
        },
      ],
    };
    mockMovieService.search.mockReturnValue(of(movieResponse));

    component.performSearch('test');

    expect(component.searchResults).toEqual([
      {
        link: '/movie/1',
        imgSrc:
          'https://image.tmdb.org/t/p/w370_and_h556_bestv2/test-poster.jpg',
        title: 'Test Movie',
        rating: 85,
        vote: 8.5,
        poster_path: '/test-poster.jpg',
      },
    ]);
  });

  it('should transform search results correctly for TV shows', () => {
    const tvResponse = {
      results: [
        {
          id: 2,
          name: 'Test TV Show',
          poster_path: '/tv-poster.jpg',
          vote_average: 7.3,
          media_type: 'tv',
        },
      ],
    };
    mockMovieService.search.mockReturnValue(of(tvResponse));

    component.performSearch('test');

    expect(component.searchResults).toEqual([
      {
        link: '/tv/2',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/tv-poster.jpg',
        title: 'Test TV Show',
        rating: 73,
        vote: 7.3,
        poster_path: '/tv-poster.jpg',
      },
    ]);
  });

  it('should transform search results correctly for persons', () => {
    const personResponse = {
      results: [
        {
          id: 3,
          name: 'Test Person',
          poster_path: '/person-photo.jpg',
          vote_average: null,
          media_type: 'person',
        },
      ],
    };
    mockMovieService.search.mockReturnValue(of(personResponse));

    component.performSearch('test');

    expect(component.searchResults).toEqual([
      {
        link: '/person/3',
        imgSrc:
          'https://image.tmdb.org/t/p/w370_and_h556_bestv2/person-photo.jpg',
        title: 'Test Person',
        rating: 'N/A',
        vote: 'N/A',
        poster_path: '/person-photo.jpg',
      },
    ]);
  });

  it('should handle items without poster_path', () => {
    const responseWithoutPoster = {
      results: [
        {
          id: 1,
          title: 'Test Movie',
          poster_path: null,
          vote_average: 8.5,
          media_type: 'movie',
        },
      ],
    };
    mockMovieService.search.mockReturnValue(of(responseWithoutPoster));

    component.performSearch('test');

    expect(component.searchResults[0].imgSrc).toBe('');
  });

  it('should handle items with zero vote_average', () => {
    const responseWithZeroRating = {
      results: [
        {
          id: 1,
          title: 'Test Movie',
          poster_path: '/poster.jpg',
          vote_average: 0,
          media_type: 'movie',
        },
      ],
    };
    mockMovieService.search.mockReturnValue(of(responseWithZeroRating));

    component.performSearch('test');

    expect(component.searchResults[0].rating).toBe('N/A');
    expect(component.searchResults[0].vote).toBe('N/A');
  });

  it('should handle items with null vote_average', () => {
    const responseWithNullRating = {
      results: [
        {
          id: 1,
          title: 'Test Movie',
          poster_path: '/poster.jpg',
          vote_average: null,
          media_type: 'movie',
        },
      ],
    };
    mockMovieService.search.mockReturnValue(of(responseWithNullRating));

    component.performSearch('test');

    expect(component.searchResults[0].rating).toBe('N/A');
    expect(component.searchResults[0].vote).toBe('N/A');
  });

  it('should use title for movies and name for TV shows and persons', () => {
    mockMovieService.search.mockReturnValue(of(mockSearchResponse));

    component.performSearch('test');

    expect(component.searchResults[0].title).toBe('Movie Title'); // movie uses title
    expect(component.searchResults[1].title).toBe('TV Show Name'); // tv uses name
    expect(component.searchResults[2].title).toBe('Person Name'); // person uses name
  });

  it('should handle search service errors and log them', () => {
    const error = new Error('Search service error');
    mockMovieService.search.mockReturnValue(throwError(() => error));
    jest.spyOn(console, 'error').mockImplementation();

    component.performSearch('test');

    expect(console.error).toHaveBeenCalledWith('Search failed', error);
  });

  it('should handle mixed media types in search results', () => {
    mockMovieService.search.mockReturnValue(of(mockSearchResponse));

    component.performSearch('test');

    expect(component.searchResults).toHaveLength(4);
    expect(component.searchResults[0].link).toBe('/movie/1');
    expect(component.searchResults[1].link).toBe('/tv/2');
    expect(component.searchResults[2].link).toBe('/person/3');
    expect(component.searchResults[3].link).toBe('/movie/4');
  });

  it('should cleanup resources on destroy', () => {
    const destroySpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should handle route parameter changes', () => {
    const paramSubject = new Subject();
    mockActivatedRoute.queryParams = paramSubject.asObservable();
    mockMovieService.search.mockReturnValue(of(mockSearchResponse));
    jest.spyOn(component, 'performSearch');

    component.ngOnInit();

    // Simulate route parameter change
    paramSubject.next({ query: 'new search term' });

    expect(component.query).toBe('new search term');
    expect(component.performSearch).toHaveBeenCalledWith('new search term');
  });

  it('should unsubscribe from observables on destroy', () => {
    const mockObservable = of(mockSearchResponse);
    const takeUntilSpy = jest.spyOn(mockObservable, 'pipe');

    mockMovieService.search.mockReturnValue(mockObservable);

    component.performSearch('test');
    component.ngOnDestroy();

    expect(takeUntilSpy).toHaveBeenCalled();
  });

  it('should handle empty search results', () => {
    const emptyResponse = { results: [] };
    mockMovieService.search.mockReturnValue(of(emptyResponse));

    component.performSearch('test');

    expect(component.searchResults).toEqual([]);
  });

  it('should handle complete integration flow', () => {
    mockMovieService.search.mockReturnValue(of(mockSearchResponse));

    component.ngOnInit();

    expect(component.query).toBe('test search');
    expect(mockMovieService.search).toHaveBeenCalledWith('test search', 1);
    expect(component.searchResults).toHaveLength(4);
    expect(component.searchResults[0].title).toBe('Movie Title');
  });
});
