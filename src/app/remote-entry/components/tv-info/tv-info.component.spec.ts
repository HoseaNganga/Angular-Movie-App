import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { of, throwError } from 'rxjs';
import { TvInfoComponent } from './tv-info.component';
import { MovieService } from '../../../services/movie.service';
import { By } from '@angular/platform-browser';

describe('TvInfoComponent', () => {
  let component: TvInfoComponent;
  let fixture: ComponentFixture<TvInfoComponent>;
  let movieService: jest.Mocked<MovieService>;
  let spinnerService: jest.Mocked<NgxSpinnerService>;

  const mockActivatedRoute = {
    params: of({ id: '456' }),
  };

  const mockMovieService = {
    getTvShow: jest.fn(),
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
      imports: [TvInfoComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MovieService, useValue: mockMovieService },
        { provide: NgxSpinnerService, useValue: mockSpinnerService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TvInfoComponent);
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
    expect(component.filteredVideos).toEqual([]);
    expect(component.videoTypes).toEqual([]);
    expect(component.backdrops).toEqual([]);
    expect(component.posters).toEqual([]);
    expect(component.recom_data).toEqual([]);
    expect(component.type).toBe('tv');
  });

  it('should set active tab', () => {
    component.setActiveTab('videos');
    expect(component.activeTab).toBe('videos');
  });

  it('should fetch TV show info and external data', () => {
    const mockTv = { id: 456, name: 'Test TV Show' };
    const mockExternal = { imdb_id: 'tt1234567' };

    movieService.getTvShow.mockReturnValue(of(mockTv));
    movieService.getExternalId.mockReturnValue(of(mockExternal));

    component.getTvInfo(456);

    expect(component.tv_data).toEqual(mockTv);
    expect(component.external_data).toEqual(mockExternal);
  });

  it('should fetch and process videos with types', () => {
    const mockVideos = {
      results: [
        { site: 'YouTube', type: 'Trailer', key: 'xyz789' },
        { site: 'YouTube', type: 'Teaser', key: 'abc123' },
      ],
    };

    movieService.getYouTubeTrailer.mockReturnValue(of(mockVideos));

    component.getTvVideos(456);

    expect(component.video_data).toEqual(mockVideos.results[0]);
    expect(component.videos).toEqual(mockVideos.results);
    expect(component.filteredVideos).toEqual(mockVideos.results);
    expect(component.videoTypes).toEqual(['ALL', 'Trailer', 'Teaser']);
  });

  it('should filter videos by type', () => {
    component.videos = [
      { site: 'YouTube', type: 'Trailer', key: 'xyz789' },
      { site: 'YouTube', type: 'Teaser', key: 'abc123' },
    ];
    component.filteredVideos = component.videos;

    const mockEvent = { target: { value: 'Trailer' } } as unknown as Event;
    component.filterVideos(mockEvent);

    expect(component.filteredVideos).toEqual([
      { site: 'YouTube', type: 'Trailer', key: 'xyz789' },
    ]);

    const mockEventAll = { target: { value: 'ALL' } } as unknown as Event;
    component.filterVideos(mockEventAll);

    expect(component.filteredVideos).toEqual(component.videos);
  });

  it('should process backdrops and posters correctly', () => {
    const mockResponse = {
      backdrops: [{ file_path: '/backdrop1.jpg' }],
      posters: [{ file_path: '/poster1.jpg' }],
    };
    movieService.getBackdrops.mockReturnValue(of(mockResponse));

    component.getTvBackdrop(456);

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

    component.getMovieCast(456);

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

  it('should process recommended TV shows correctly', () => {
    const mockResponse = {
      results: [
        {
          id: 789,
          name: 'Recommended TV Show',
          poster_path: '/recommended.jpg',
          vote_average: 8.5,
        },
      ],
    };
    movieService.getRecommended.mockReturnValue(of(mockResponse));

    component.getTvRecommended(456, 1);

    expect(component.recom_data).toEqual([
      {
        link: '/tv/789',
        imgSrc:
          'https://image.tmdb.org/t/p/w370_and_h556_bestv2/recommended.jpg',
        title: 'Recommended TV Show',
        vote: 8.5,
        rating: 85,
      },
    ]);
  });

  it('should handle errors gracefully for cast', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    movieService.getCredits.mockReturnValue(
      throwError(() => new Error('API Error'))
    );

    component.getMovieCast(456);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching credits data',
      expect.any(Error)
    );
  });

  it('should handle errors gracefully for recommendations', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    movieService.getRecommended.mockReturnValue(
      throwError(() => new Error('API Error'))
    );

    component.getTvRecommended(456, 1);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching recommended movies data',
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
