import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MovieService } from '../../../../services/movie.service';
import { EpisodesComponent } from './episodes.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, Subject, throwError } from 'rxjs';

describe('EpisodesComponent', () => {
  let component: EpisodesComponent;
  let fixture: ComponentFixture<EpisodesComponent>;
  let movieServiceMock: jest.Mocked<MovieService>;
  let spinnerServiceMock: jest.Mocked<NgxSpinnerService>;
  let activatedRouteMock: any;

  beforeEach(async () => {
    movieServiceMock = {
      getTvShow: jest.fn(),
      getTvShowEpisodes: jest.fn(),
    } as any;

    spinnerServiceMock = {
      show: jest.fn(),
      hide: jest.fn(),
    } as any;

    activatedRouteMock = {
      params: new Subject(),
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule, CommonModule, EpisodesComponent],
      providers: [
        { provide: MovieService, useValue: movieServiceMock },
        { provide: NgxSpinnerService, useValue: spinnerServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EpisodesComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with route params and fetch TV show data', () => {
    const mockTvShow = {
      seasons: [{ season_number: 1 }, { season_number: 2 }],
    };
    movieServiceMock.getTvShow.mockReturnValue(of(mockTvShow));
    movieServiceMock.getTvShowEpisodes.mockReturnValue(of({ episodes: [] }));

    /
    activatedRouteMock.params.next({ id: '123' });
    fixture.detectChanges();

    expect(component.id).toBe(123);
    expect(spinnerServiceMock.show).toHaveBeenCalled();
    expect(movieServiceMock.getTvShow).toHaveBeenCalledWith(123);
    expect(component.seasons).toEqual([
      { season_number: 1 },
      { season_number: 2 },
    ]);
    expect(component.selectedSeason).toBe(1);
    expect(movieServiceMock.getTvShowEpisodes).toHaveBeenCalledWith(123, 1);
    expect(spinnerServiceMock.hide).toHaveBeenCalled();
  });

  it('should handle error when fetching TV show data', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    movieServiceMock.getTvShow.mockReturnValue(
      throwError(() => new Error('API error'))
    );

    activatedRouteMock.params.next({ id: '123' });
    fixture.detectChanges();

    expect(spinnerServiceMock.show).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching data',
      expect.any(Error)
    );
    expect(spinnerServiceMock.hide).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should load episodes when season changes', () => {
    const mockEpisodes = {
      episodes: [{ episode_number: 1, name: 'Test Episode' }],
    };
    movieServiceMock.getTvShowEpisodes.mockReturnValue(of(mockEpisodes));
    component.id = 123;
    component.selectedSeason = 1;

    const mockEvent = { target: { value: '2' } };
    component.onSeasonChange(mockEvent);

    expect(movieServiceMock.getTvShowEpisodes).toHaveBeenCalledWith(123, 2); // Expect number 2
    expect(component.episodes_data).toEqual(mockEpisodes.episodes);
  });

  it('should handle error when fetching episodes', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    movieServiceMock.getTvShowEpisodes.mockReturnValue(
      throwError(() => new Error('Episodes error'))
    );
    component.id = 123;

    component.loadEpisodes(123, 1);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching episodes:',
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });

  it('should clean up subscriptions on destroy', () => {
    const destroyNextSpy = jest.spyOn(component['destroy$'], 'next');
    const destroyCompleteSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroyNextSpy).toHaveBeenCalled();
    expect(destroyCompleteSpy).toHaveBeenCalled();
  });
});
