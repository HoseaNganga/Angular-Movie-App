import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SliderComponent } from './slider.component';
import { ModalComponent } from '../modal/modal.component';
import { NumberWithCommasPipe } from '../pipes/NumberWithCommas/numberwithcommas.pipe';
import { MovieService } from '../../../../services/movie.service';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TruncatePipe } from '../pipes/Truncate/truncate.pipe';

class MockTruncatePipe {
  transform(value: string, length: number = 218): string {
    if (!value) return '';
    if (value.length <= length) return value;
    return value.slice(0, length - 3) + '...';
  }
}

class MockNumberWithCommasPipe {
  transform(value: number): string {
    if (value == null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

class MockMovieService {
  getYouTubeTrailer(id: number, mediaType: string) {
    return of({
      results: [{ site: 'YouTube', type: 'Trailer', key: 'abc123' }],
    });
  }
}

// Mock ModalComponent
class MockModalComponent {
  openModal(videoUrl: string) {}
}

describe('SliderComponent', () => {
  let component: SliderComponent;
  let fixture: ComponentFixture<SliderComponent>;
  let mockMovieService: MockMovieService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterModule.forRoot([]),
        SliderComponent,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: MovieService, useClass: MockMovieService },
        { provide: TruncatePipe, useClass: MockTruncatePipe },
        { provide: NumberWithCommasPipe, useClass: MockNumberWithCommasPipe },
        { provide: ModalComponent, useClass: MockModalComponent },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SliderComponent);
    component = fixture.componentInstance;
    mockMovieService = TestBed.inject(MovieService) as any;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    if ((component as any)['intervalId']) {
      clearInterval((component as any)['intervalId']);
    }
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the current slide based on data and current index', () => {
    component.data = [
      {
        id: 1,
        title: 'Movie 1',
        backdrop_path: '/path1.jpg',
        vote_average: 8,
        vote_count: 1000,
        overview: 'A great movie',
      },
    ];
    component.current = 0;
    fixture.detectChanges();

    const slide = fixture.debugElement.query(By.css('.hero-slide'));
    const title = fixture.debugElement.query(By.css('.name'));
    const image = fixture.debugElement.query(By.css('.image'));
    const overview = fixture.debugElement.query(By.css('.desc'));

    expect(slide).not.toBeNull();
    expect(title.nativeElement.textContent).toContain('Movie 1');
    expect(image.nativeElement.src).toContain(
      'https://image.tmdb.org/t/p/original/path1.jpg'
    );
    expect(overview.nativeElement.textContent).toContain('A great movie');
  });

  it('should not render slides when data is empty', () => {
    component.data = [];
    fixture.detectChanges();

    const slide = fixture.debugElement.query(By.css('.hero-slide'));
    expect(slide).toBeNull();
  });

  it('should advance current index with sliderTimer', fakeAsync(() => {
    component.data = [{ id: 1 }, { id: 2 }, { id: 3 }];
    component.current = 0;
    component.sliderTimer();
    tick(10000);

    expect(component.current).toBe(1);
    tick(10000);
    expect(component.current).toBe(2);
    tick(10000);
    expect(component.current).toBe(0);
  }));

  it('should clear interval and complete destroy$ on ngOnDestroy', () => {
    jest.spyOn(window, 'clearInterval');
    const destroyNextSpy = jest.spyOn((component as any).destroy$, 'next');
    const destroyCompleteSpy = jest.spyOn(
      (component as any).destroy$,
      'complete'
    );
    component.sliderTimer();
    component.ngOnDestroy();

    expect(window.clearInterval).toHaveBeenCalledWith(
      (component as any).intervalId
    );

    expect(destroyNextSpy).toHaveBeenCalled();
    expect(destroyCompleteSpy).toHaveBeenCalled();
  });

  it('should call openTrailer and open modal with correct video URL', () => {
    const modalSpy = jest.spyOn(component.modal, 'openModal');
    component.data = [{ id: 1, title: 'Movie 1' }];
    component.openTrailer(component.data[0]);

    expect(modalSpy).toHaveBeenCalledWith(
      'https://www.youtube.com/embed/abc123?rel=0&autoplay=1&mute=1'
    );
  });

  it('should unsubscribe from getYouTubeTrailer on destroy', () => {
    const getTrailerSpy = jest.spyOn(mockMovieService, 'getYouTubeTrailer');

    component.data = [{ id: 1, title: 'Movie 1' }];
    component.openTrailer(component.data[0]);

    const destroyNextSpy = jest.spyOn((component as any).destroy$, 'next');
    const destroyCompleteSpy = jest.spyOn(
      (component as any).destroy$,
      'complete'
    );

    component.ngOnDestroy();

    expect(getTrailerSpy).toHaveBeenCalled();
    expect(destroyNextSpy).toHaveBeenCalled();
    expect(destroyCompleteSpy).toHaveBeenCalled();
  });

  it('should show alert when no trailer is found', () => {
    jest
      .spyOn(mockMovieService, 'getYouTubeTrailer')
      .mockReturnValue(of({ results: [] }));
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    component.data = [{ id: 1, title: 'Movie 1' }];
    component.openTrailer(component.data[0]);

    expect(window.alert).toHaveBeenCalledWith(
      'No trailer or video available for this TV show.'
    );
  });

  it('should handle click on trailer button', () => {
    component.data = [{ id: 1, title: 'Movie 1', videoId: 'abc123' }];
    component.current = 0;
    fixture.detectChanges();

    const trailerButton = fixture.debugElement.query(By.css('.trailer'));
    const modalSpy = jest.spyOn(component.modal, 'openModal');
    trailerButton.triggerEventHandler('click', null);

    expect(modalSpy).toHaveBeenCalledWith(
      'https://www.youtube.com/embed/abc123?rel=0&autoplay=1&mute=1'
    );
  });

  it('should render rating stars based on vote_average', () => {
    component.data = [
      { id: 1, title: 'Movie 1', vote_average: 8, vote_count: 1000 },
    ];
    component.current = 0;
    fixture.detectChanges();

    const ratingStars = fixture.debugElement.query(By.css('.stars div'));
    expect(ratingStars.styles['width']).toBe('80%');
  });

  it('should render season info for TV shows', () => {
    component.data = [{ id: 1, name: 'Show 1', number_of_seasons: 2 }];
    component.current = 0;
    fixture.detectChanges();

    const seasonInfo = fixture.debugElement.query(By.css('.info span'));
    expect(seasonInfo.nativeElement.textContent).toContain('Season 2');
  });
});
