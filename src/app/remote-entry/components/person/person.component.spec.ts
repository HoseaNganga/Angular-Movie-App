import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChangeDetectorRef } from '@angular/core';
import { of, throwError, Subject } from 'rxjs';
import { PersonComponent } from './person.component';
import { MovieService } from '../../../services/movie.service';
import { CommonModule } from '@angular/common';
import { MediaComponent } from '../global/media/media.component';
import { ListingComponent } from '../global/listing/listing.component';
import { ImagesComponent } from '../global/images/images.component';
import { SortByYearPipe } from '../global/pipes/SortByYear/sort-by-year.pipe';

describe('PersonComponent', () => {
  let component: PersonComponent;
  let fixture: ComponentFixture<PersonComponent>;
  let mockMovieService: jest.Mocked<MovieService>;
  let mockActivatedRoute: any;
  let mockSpinnerService: jest.Mocked<NgxSpinnerService>;
  let mockChangeDetectorRef: jest.Mocked<ChangeDetectorRef>;

  const mockPersonData = {
    id: 1,
    name: 'John Doe',
    biography: 'Test biography',
    birthday: '1980-01-01',
  };

  const mockExternalData = {
    imdb_id: 'nm1234567',
    instagram_id: 'johndoe',
    twitter_id: 'johndoe',
  };

  const mockPersonImages = {
    profiles: [
      {
        file_path: '/profile1.jpg',
        aspect_ratio: 0.667,
      },
      {
        file_path: '/profile2.jpg',
        aspect_ratio: 0.667,
      },
    ],
  };

  const mockPersonCredits = {
    cast: [
      {
        id: 1,
        title: 'Movie 1',
        release_date: '2023-01-01',
        poster_path: '/poster1.jpg',
        vote_average: 8.5,
      },
      {
        id: 2,
        title: 'Movie 2',
        first_air_date: '2022-05-15',
        poster_path: '/poster2.jpg',
        vote_average: 7.2,
      },
      {
        id: 3,
        title: 'Movie 3',
        release_date: null,
        first_air_date: null,
        poster_path: null,
        vote_average: 6.8,
      },
    ],
  };

  beforeEach(async () => {
    mockMovieService = {
      getPerson: jest.fn(),
      getPersonExternalId: jest.fn(),
      getPersonImages: jest.fn(),
      getPersonCredit: jest.fn(),
    } as any;

    mockActivatedRoute = {
      params: of({ id: '1' }),
    };

    mockSpinnerService = {
      show: jest.fn(),
      hide: jest.fn(),
    } as any;

    mockChangeDetectorRef = {
      detectChanges: jest.fn(),
      detach: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        PersonComponent,
        MediaComponent,
        ListingComponent,
        ImagesComponent,
        SortByYearPipe,
      ],
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: NgxSpinnerService, useValue: mockSpinnerService },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.activeTab).toBe('knownfor');
    expect(component.posters_data).toEqual([]);
    expect(component.id).toBeUndefined();
    expect(component.person_data).toBeUndefined();
    expect(component.external_data).toBeUndefined();
    expect(component.posters).toBeUndefined();
    expect(component.knownfor).toBeUndefined();
  });

  it('should extract id from route params and call service methods on ngOnInit', () => {
    mockMovieService.getPerson.mockReturnValue(of(mockPersonData));
    mockMovieService.getPersonExternalId.mockReturnValue(of(mockExternalData));
    mockMovieService.getPersonImages.mockReturnValue(of(mockPersonImages));
    mockMovieService.getPersonCredit.mockReturnValue(of(mockPersonCredits));

    jest.spyOn(component, 'getPersonDetails');
    jest.spyOn(component, 'getPersonPoster');
    jest.spyOn(component, 'getKnowFor');

    component.ngOnInit();

    expect(component.id).toBe(1);
    expect(mockSpinnerService.show).toHaveBeenCalled();
    expect(component.getPersonDetails).toHaveBeenCalledWith(1);
    expect(component.getPersonPoster).toHaveBeenCalledWith(1);
    expect(component.getKnowFor).toHaveBeenCalledWith(1);
  });

  it('should hide spinner after 2 seconds', (done) => {
    mockMovieService.getPerson.mockReturnValue(of(mockPersonData));
    mockMovieService.getPersonExternalId.mockReturnValue(of(mockExternalData));
    mockMovieService.getPersonImages.mockReturnValue(of(mockPersonImages));
    mockMovieService.getPersonCredit.mockReturnValue(of(mockPersonCredits));

    jest.useFakeTimers();

    component.ngOnInit();

    expect(mockSpinnerService.hide).not.toHaveBeenCalled();

    jest.advanceTimersByTime(2000);

    expect(mockSpinnerService.hide).toHaveBeenCalled();

    jest.useRealTimers();
    done();
  });

  it('should set the active tab', () => {
    component.setActiveTab('overview');
    expect(component.activeTab).toBe('overview');

    component.setActiveTab('credits');
    expect(component.activeTab).toBe('credits');
  });

  it('should fetch person details and call getPersonalExternal', () => {
    mockMovieService.getPerson.mockReturnValue(of(mockPersonData));
    jest.spyOn(component, 'getPersonalExternal');

    component.getPersonDetails(1);

    expect(mockMovieService.getPerson).toHaveBeenCalledWith(1);
    expect(component.person_data).toEqual(mockPersonData);
    expect(component.getPersonalExternal).toHaveBeenCalledWith(1);
  });

  it('should handle errors gracefully in getPersonDetails', () => {
    const error = new Error('Service error');
    mockMovieService.getPerson.mockReturnValue(throwError(() => error));
    jest.spyOn(console, 'error').mockImplementation();

    expect(() => component.getPersonDetails(1)).not.toThrow();
    expect(mockMovieService.getPerson).toHaveBeenCalledWith(1);
  });

  it('should fetch external person data', () => {
    mockMovieService.getPersonExternalId.mockReturnValue(of(mockExternalData));

    component.getPersonalExternal(1);

    expect(mockMovieService.getPersonExternalId).toHaveBeenCalledWith(1);
    expect(component.external_data).toEqual(mockExternalData);
  });

  it('should handle errors gracefully in getPersonalExternal', () => {
    const error = new Error('Service error');
    mockMovieService.getPersonExternalId.mockReturnValue(
      throwError(() => error)
    );

    expect(() => component.getPersonalExternal(1)).not.toThrow();
    expect(mockMovieService.getPersonExternalId).toHaveBeenCalledWith(1);
  });

  it('should fetch and transform person images', () => {
    mockMovieService.getPersonImages.mockReturnValue(of(mockPersonImages));

    component.getPersonPoster(1);

    expect(mockMovieService.getPersonImages).toHaveBeenCalledWith(1);
    expect(component.posters).toEqual([
      {
        file_path: '/profile1.jpg',
        aspect_ratio: 0.667,
        full_path:
          'https://image.tmdb.org/t/p/w370_and_h556_bestv2//profile1.jpg',
      },
      {
        file_path: '/profile2.jpg',
        aspect_ratio: 0.667,
        full_path:
          'https://image.tmdb.org/t/p/w370_and_h556_bestv2//profile2.jpg',
      },
    ]);
  });

  it('should handle profiles without file_path', () => {
    const mockImagesWithoutPath = {
      profiles: [
        {
          file_path: null,
          aspect_ratio: 0.667,
        },
      ],
    };
    mockMovieService.getPersonImages.mockReturnValue(of(mockImagesWithoutPath));

    component.getPersonPoster(1);

    expect(component.posters[0].full_path).toBeNull();
  });

  it('should handle errors gracefully in getPersonPoster', () => {
    const error = new Error('Service error');
    mockMovieService.getPersonImages.mockReturnValue(throwError(() => error));

    expect(() => component.getPersonPoster(1)).not.toThrow();
    expect(mockMovieService.getPersonImages).toHaveBeenCalledWith(1);
  });

  it('should handle credits without poster_path', () => {
    const mockCreditsWithoutPoster = {
      cast: [
        {
          id: 1,
          title: 'Movie 1',
          release_date: '2023-01-01',
          poster_path: null,
          vote_average: 8.5,
        },
      ],
    };
    mockMovieService.getPersonCredit.mockReturnValue(
      of(mockCreditsWithoutPoster)
    );

    component.getKnowFor(1);

    expect(component.knownfor[0].imgSrc).toBeNull();
  });

  it('should prioritize release_date over first_air_date for year calculation', () => {
    const mockCreditsWithBothDates = {
      cast: [
        {
          id: 1,
          title: 'Movie 1',
          release_date: '2023-01-01',
          first_air_date: '2022-01-01',
          poster_path: '/poster1.jpg',
          vote_average: 8.5,
        },
      ],
    };
    mockMovieService.getPersonCredit.mockReturnValue(
      of(mockCreditsWithBothDates)
    );

    component.getKnowFor(1);

    expect(component.knownfor[0].year).toBe(2023);
  });

  it('should handle service errors and log them in getKnowFor', () => {
    const error = new Error('Service error');
    mockMovieService.getPersonCredit.mockReturnValue(throwError(() => error));
    jest.spyOn(console, 'error').mockImplementation();

    component.getKnowFor(1);

    expect(console.error).toHaveBeenCalledWith(
      'Error fetching credits data',
      error
    );
  });

  it('should handle complete flow from ngOnInit', () => {
    mockMovieService.getPerson.mockReturnValue(of(mockPersonData));
    mockMovieService.getPersonExternalId.mockReturnValue(of(mockExternalData));
    mockMovieService.getPersonImages.mockReturnValue(of(mockPersonImages));
    mockMovieService.getPersonCredit.mockReturnValue(of(mockPersonCredits));

    component.ngOnInit();

    expect(component.id).toBe(1);
    expect(component.person_data).toEqual(mockPersonData);
    expect(component.external_data).toEqual(mockExternalData);
    expect(component.posters).toBeDefined();
    expect(component.knownfor).toBeDefined();
    expect(mockSpinnerService.show).toHaveBeenCalled();
  });

  it('should handle route parameter changes', () => {
    const paramSubject = new Subject();
    mockActivatedRoute.params = paramSubject.asObservable();

    mockMovieService.getPerson.mockReturnValue(of(mockPersonData));
    mockMovieService.getPersonExternalId.mockReturnValue(of(mockExternalData));
    mockMovieService.getPersonImages.mockReturnValue(of(mockPersonImages));
    mockMovieService.getPersonCredit.mockReturnValue(of(mockPersonCredits));

    component.ngOnInit();

    paramSubject.next({ id: '2' });

    expect(component.id).toBe(2);
    expect(mockMovieService.getPerson).toHaveBeenCalledWith(2);
  });

  it('should unsubscribe from observables on destroy', () => {
    const mockObservable = of(mockPersonData);
    const takeUntilSpy = jest.spyOn(mockObservable, 'pipe');

    mockMovieService.getPerson.mockReturnValue(mockObservable);

    component.getPersonDetails(1);
    component.ngOnDestroy();

    expect(takeUntilSpy).toHaveBeenCalled();
  });
});
