import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { HeroComponent } from './hero.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovieService } from '../../../../services/movie.service';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { Component, Input, Pipe, PipeTransform } from '@angular/core';

// Mock ModalComponent
@Component({
  selector: 'app-modal',
  template: '',
})
class MockModalComponent {
  @Input() videoUrl: string | undefined;
  openModal = jest.fn();
  closeModal = jest.fn();
}

// Mock pipes
@Pipe({ name: 'numberWithCommas' })
class MockNumberWithCommasPipe implements PipeTransform {
  transform(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

@Pipe({ name: 'truncate' })
class MockTruncatePipe implements PipeTransform {
  transform(value: string): string {
    return value.slice(0, 100) + '...';
  }
}

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;
  let movieService: MovieService;

  const mockMovieService = {
    getYouTubeTrailer: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule.forRoot([]),
        HeroComponent,
        MockModalComponent,
        MockNumberWithCommasPipe,
        MockTruncatePipe,
      ],

      providers: [{ provide: MovieService, useValue: mockMovieService }],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    movieService = TestBed.inject(MovieService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render nothing when data is undefined', fakeAsync(() => {
    component.data = null;
    fixture.detectChanges();
    tick();

    const heroSection = fixture.nativeElement.querySelector('.hero');
    expect(heroSection).toBeNull();
  }));

  it('should render TV data with seasons and first air date', fakeAsync(() => {
    component.data = {
      name: 'Test TV Show',
      backdrop_path: '/backdrop.jpg',
      vote_average: 8.0,
      vote_count: 500,
      number_of_seasons: 2,
      first_air_date: '2020-01-01',
      overview: 'A dramatic TV series.',
      videoId: 'def456',
    };
    fixture.detectChanges();
    tick();

    const title = fixture.nativeElement.querySelector('.name');
    expect(title.textContent.trim()).toBe('Test TV Show');

    const meta = fixture.nativeElement.querySelectorAll('.info span');
    expect(meta.length).toBe(2);
    expect(meta[0].textContent).toBe('Season 2');
    expect(meta[1].textContent).toContain('2020');

    const trailerButton = fixture.nativeElement.querySelector('.trailer');
    expect(trailerButton).toBeTruthy();
  }));

  it('should open modal with YouTube trailer URL when openTrailer is called with valid video', fakeAsync(() => {
    component.data = { id: 123, title: 'Test Movie', videoId: 'abc123' };
    const mockResponse = {
      results: [
        { site: 'YouTube', type: 'Trailer', key: 'xyz789' },
        { site: 'Vimeo', type: 'Clip', key: 'ignore' },
      ],
    };
    jest
      .spyOn(movieService, 'getYouTubeTrailer')
      .mockReturnValue(of(mockResponse));
    fixture.detectChanges();
    tick();

    const modal = fixture.debugElement.query(
      By.css('app-modal')
    ).componentInstance;
    jest.spyOn(modal, 'openModal');

    component.openTrailer();
    tick();

    expect(movieService.getYouTubeTrailer).toHaveBeenCalledWith(123, 'movie');
    expect(modal.openModal).toHaveBeenCalledWith(
      'https://www.youtube.com/embed/xyz789?rel=0&autoplay=1&mute=1'
    );
  }));

  it('should show alert when no trailer is found', fakeAsync(() => {
    component.data = { id: 123, number_of_seasons: 2, name: 'Test TV' };
    jest
      .spyOn(movieService, 'getYouTubeTrailer')
      .mockReturnValue(of({ results: [] }));
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fixture.detectChanges();
    tick();

    component.openTrailer();
    tick();

    expect(movieService.getYouTubeTrailer).toHaveBeenCalledWith(123, 'tv');
    expect(window.alert).toHaveBeenCalledWith(
      'No trailer or video available for this media.'
    );
    expect(console.error).toHaveBeenCalledWith(
      'No trailer or relevant video found for this media.'
    );
  }));

  it('should handle error when fetching trailer fails', fakeAsync(() => {
    component.data = { id: 123, title: 'Test Movie' };
    jest
      .spyOn(movieService, 'getYouTubeTrailer')
      .mockReturnValue(throwError(() => new Error('API Error')));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fixture.detectChanges();
    tick();

    component.openTrailer();
    tick();

    expect(movieService.getYouTubeTrailer).toHaveBeenCalledWith(123, 'movie');
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching YouTube video:',
      expect.any(Error)
    );
  }));

  it('should unsubscribe from trailer subscription on ngOnDestroy', () => {
    const destroySpy = jest.spyOn(component['destroy$'], 'next');
    const completeSpy = jest.spyOn(component['destroy$'], 'complete');

    component.ngOnDestroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should not call openTrailer when trailer button is clicked if videoId is missing', fakeAsync(() => {
    component.data = {
      title: 'Test Movie',
      backdrop_path: '/backdrop.jpg',
      vote_average: 7.5,
      vote_count: 1000,
      release_date: '2023-01-01',
      overview: 'A thrilling movie.',
    };
    jest.spyOn(component, 'openTrailer');
    fixture.detectChanges();
    tick();

    const trailerButton = fixture.nativeElement.querySelector('.trailer');
    expect(trailerButton).toBeNull();
    expect(component.openTrailer).not.toHaveBeenCalled();
  }));
});
