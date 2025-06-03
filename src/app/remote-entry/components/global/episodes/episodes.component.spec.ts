import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { of, throwError, Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { EpisodesComponent } from './episodes.component';
import { MovieService } from '../../../../services/movie.service';

describe('EpisodesComponent', () => {
  let component: EpisodesComponent;
  let fixture: ComponentFixture<EpisodesComponent>;
  let movieService: jest.Mocked<MovieService>;
  let spinner: jest.Mocked<NgxSpinnerService>;
  let activatedRoute: any;

  const mockTvShowData = {
    id: 123,
    name: 'Test TV Show',
    seasons: [
      { season_number: 0, name: 'Specials' },
      { season_number: 1, name: 'Season 1' },
      { season_number: 2, name: 'Season 2' },
      { season_number: 3, name: 'Season 3' },
    ],
  };

  const mockEpisodesData = {
    episodes: [
      {
        id: 1,
        name: 'Episode 1',
        episode_number: 1,
        season_number: 1,
        overview: 'First episode',
      },
      {
        id: 2,
        name: 'Episode 2',
        episode_number: 2,
        season_number: 1,
        overview: 'Second episode',
      },
    ],
  };

  beforeEach(async () => {
    const movieServiceMock = {
      getTvShow: jest.fn(),
      getTvShowEpisodes: jest.fn(),
    };

    const spinnerMock = {
      show: jest.fn(),
      hide: jest.fn(),
    };

    const activatedRouteMock = {
      params: of({ id: '123' }),
    };

    await TestBed.configureTestingModule({
      imports: [EpisodesComponent, FormsModule, CommonModule],
      providers: [
        { provide: MovieService, useValue: movieServiceMock },
        { provide: NgxSpinnerService, useValue: spinnerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EpisodesComponent);
    component = fixture.componentInstance;
    movieService = TestBed.inject(MovieService) as jest.Mocked<MovieService>;
    spinner = TestBed.inject(
      NgxSpinnerService
    ) as jest.Mocked<NgxSpinnerService>;
    activatedRoute = TestBed.inject(ActivatedRoute);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component with route params and fetch TV show data', () => {
    movieService.getTvShow.mockReturnValue(of(mockTvShowData));
    movieService.getTvShowEpisodes.mockReturnValue(of(mockEpisodesData));

    component.ngOnInit();

    expect(spinner.show).toHaveBeenCalled();
    expect(component.id).toBe(123);
    expect(movieService.getTvShow).toHaveBeenCalledWith(123);
  });

  it('should handle error when fetching TV show data', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    movieService.getTvShow.mockReturnValue(throwError('API Error'));

    component.ngOnInit();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching data',
      'API Error'
    );
    expect(spinner.hide).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should filter out season 0 and set selected season', () => {
    movieService.getTvShowEpisodes.mockReturnValue(of(mockEpisodesData));

    component.handleTvInfo(mockTvShowData);

    expect(component.seasons).toHaveLength(3);
    expect(
      component.seasons.every((season) => season.season_number !== 0)
    ).toBeTruthy();
    expect(component.selectedSeason).toBe(1);
  });

  it('should set selectedSeason to 1 when no seasons available', () => {
    const dataWithoutSeasons = {
      ...mockTvShowData,
      seasons: [{ season_number: 0 }],
    };
    movieService.getTvShowEpisodes.mockReturnValue(of(mockEpisodesData));

    component.handleTvInfo(dataWithoutSeasons);

    expect(component.seasons).toHaveLength(0);
    expect(component.selectedSeason).toBe(1);
  });

  it('should call loadEpisodes with correct parameters', () => {
    const loadEpisodesSpy = jest
      .spyOn(component, 'loadEpisodes')
      .mockImplementation(() => {});
    component.id = 123;

    component.handleTvInfo(mockTvShowData);

    expect(loadEpisodesSpy).toHaveBeenCalledWith(123, 1);
  });

  it('should load episodes successfully', () => {
    movieService.getTvShowEpisodes.mockReturnValue(of(mockEpisodesData));

    component.loadEpisodes(123, 1);

    expect(movieService.getTvShowEpisodes).toHaveBeenCalledWith(123, 1);
    expect(component.episodes_data).toEqual(mockEpisodesData.episodes);
  });

  it('should handle error when loading episodes', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    movieService.getTvShowEpisodes.mockReturnValue(
      throwError('Episodes API Error')
    );

    component.loadEpisodes(123, 1);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching episodes:',
      'Episodes API Error'
    );

    consoleErrorSpy.mockRestore();
  });

  it('should load episodes for selected season on season change', () => {
    const loadEpisodesSpy = jest
      .spyOn(component, 'loadEpisodes')
      .mockImplementation(() => {});
    component.id = 123;

    const mockEvent = {
      target: { value: '2' },
    };

    component.onSeasonChange(mockEvent);

    expect(loadEpisodesSpy).toHaveBeenCalledWith(123, '2');
  });

  it('should complete destroy subject on component destroy', () => {
    const destroySpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should complete full flow from route params to TV show to episodes', () => {
    movieService.getTvShow.mockReturnValue(of(mockTvShowData));
    movieService.getTvShowEpisodes.mockReturnValue(of(mockEpisodesData));

    component.ngOnInit();

    expect(spinner.show).toHaveBeenCalled();
    expect(movieService.getTvShow).toHaveBeenCalledWith(123);
    expect(movieService.getTvShowEpisodes).toHaveBeenCalledWith(123, 1);
    expect(component.episodes_data).toEqual(mockEpisodesData.episodes);
    expect(component.seasons).toHaveLength(3);
    expect(component.selectedSeason).toBe(1);
    expect(spinner.hide).toHaveBeenCalled();
  });

  it('should handle route parameter changes', () => {
    const paramsSubject = new Subject();
    activatedRoute.params = paramsSubject.asObservable();

    movieService.getTvShow.mockReturnValue(of(mockTvShowData));
    movieService.getTvShowEpisodes.mockReturnValue(of(mockEpisodesData));

    component.ngOnInit();

    paramsSubject.next({ id: '456' });

    expect(component.id).toBe(456);
    expect(movieService.getTvShow).toHaveBeenCalledWith(456);
  });

  it('should hide spinner on TV show fetch error', () => {
    movieService.getTvShow.mockReturnValue(throwError('Network Error'));

    component.ngOnInit();

    expect(spinner.hide).toHaveBeenCalled();
  });

  it('should not crash when episodes data is malformed', () => {
    movieService.getTvShow.mockReturnValue(of(mockTvShowData));
    movieService.getTvShowEpisodes.mockReturnValue(of({ episodes: null }));

    expect(() => {
      component.ngOnInit();
    }).not.toThrow();
  });
});
