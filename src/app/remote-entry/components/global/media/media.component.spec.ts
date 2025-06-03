import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MediaComponent } from './media.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';

// Mock pipes
@Pipe({ name: 'languageName' })
class MockLanguageNamePipe implements PipeTransform {
  transform(value: string): string {
    return `Lang_${value}`;
  }
}

@Pipe({ name: 'numberWithCommas' })
class MockNumberWithCommasPipe implements PipeTransform {
  transform(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

@Pipe({ name: 'time' })
class MockTimePipe implements PipeTransform {
  transform(value: number): string {
    return `${Math.floor(value / 60)}h ${value % 60}m`;
  }
}

describe('MediaComponent', () => {
  let component: MediaComponent;
  let fixture: ComponentFixture<MediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterModule.forRoot([]), MediaComponent],
      providers: [
        { provide: 'LanguageNamePipe', useClass: MockLanguageNamePipe },
        { provide: 'NumberWithCommasPipe', useClass: MockNumberWithCommasPipe },
        { provide: 'TimePipe', useClass: MockTimePipe },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaComponent);
    component = fixture.componentInstance;
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

    const leftSection = fixture.nativeElement.querySelector('.left');
    const rightSection = fixture.nativeElement.querySelector('.right');
    expect(leftSection).toBeNull();
    expect(rightSection).toBeNull();
  }));

  it('should render person type with image, biography, stats, and external links', fakeAsync(() => {
    component.type = 'person';
    component.data = {
      name: 'Test Person',
      profile_path: '/profile1.jpg',
      biography: 'Person biography',
      known_for_department: 'Acting',
      birthday: '1980-01-01',
      place_of_birth: 'New York',
    };
    component.externalData = { instagram_id: 'person_instagram' };
    fixture.detectChanges();
    tick();

    const img = fixture.nativeElement.querySelector('.poster img');
    expect(img.getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w370_and_h556_bestv2//profile1.jpg'
    );
    expect(img.getAttribute('alt')).toBe('Test Person');

    const biography = fixture.nativeElement.querySelector('.overview div');
    expect(biography.textContent.trim()).toBe('Person biography');

    const statsItems =
      fixture.nativeElement.querySelectorAll('.stats .nolist li');
    expect(statsItems.length).toBe(3);
    expect(statsItems[0].querySelector('.label').textContent).toBe('Known For');
    expect(statsItems[0].querySelector('.value').textContent).toBe('Acting');
    expect(statsItems[1].querySelector('.label').textContent).toBe('Born');
    expect(statsItems[1].querySelector('.value').textContent).toContain('1980');
    expect(statsItems[2].querySelector('.label').textContent).toBe(
      'Place of Birth'
    );
    expect(statsItems[2].querySelector('.value').textContent).toBe('New York');

    const externalLinks = fixture.nativeElement.querySelectorAll(
      '.external .nolist li a'
    );
    expect(externalLinks.length).toBe(1);
    expect(externalLinks[0].getAttribute('href')).toBe(
      'https://instagram.com/person_instagram'
    );
  }));
});
