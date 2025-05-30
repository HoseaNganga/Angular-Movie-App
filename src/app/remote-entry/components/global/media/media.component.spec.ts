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

  it('should render movie type with image, storyline, stats, and external links', fakeAsync(() => {
    component.type = 'movie';
    component.data = {
      title: 'Test Movie',
      poster_path: '/poster1.jpg',
      overview: 'Movie storyline',
      release_date: '2023-01-01',
      runtime: 120,
      budget: 1000000,
      revenue: 2000000,
      genres: [{ id: '1', name: 'Action' }],
      status: 'Released',
      spoken_languages: [{ name: 'English' }],
    };
    component.externalData = {
      twitter_id: 'movie_twitter',
      imdb_id: 'tt1234567',
    };
    fixture.detectChanges();
    tick();

    const img = fixture.nativeElement.querySelector('.poster img');
    expect(img.getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w370_and_h556_bestv2//poster1.jpg'
    );
    expect(img.getAttribute('alt')).toBe('Test Movie');

    const storyline = fixture.nativeElement.querySelector('.overview div');
    expect(storyline.textContent.trim()).toBe('Movie storyline');

    const statsItems =
      fixture.nativeElement.querySelectorAll('.stats .nolist li');
    expect(statsItems.length).toBe(7);
    expect(statsItems[0].querySelector('.label').textContent).toBe('Released');
    expect(statsItems[0].querySelector('.value').textContent).toContain('2023');
    expect(statsItems[1].querySelector('.label').textContent).toBe('Runtime');
    expect(statsItems[1].querySelector('.value').textContent).toBe('2h 0min');
    expect(statsItems[2].querySelector('.label').textContent).toBe('Budget');
    expect(statsItems[2].querySelector('.value').textContent).toBe(
      '$1,000,000'
    );
    expect(statsItems[3].querySelector('.label').textContent).toBe('Revenue');
    expect(statsItems[3].querySelector('.value').textContent).toBe(
      '$2,000,000'
    );
    expect(statsItems[4].querySelector('.label').textContent).toBe('Genre');
    expect(statsItems[4].querySelector('a').textContent).toBe('Action');
    expect(
      statsItems[4].querySelector('a').getAttribute('ng-reflect-router-link')
    ).toBe('/genres,1,movie');
    expect(statsItems[5].querySelector('.label').textContent).toBe('Status');
    expect(statsItems[5].querySelector('.value').textContent).toBe('Released');
    expect(statsItems[6].querySelector('.label').textContent).toBe('Language');
    expect(statsItems[6].querySelector('a').textContent).toBe('English');

    const externalLinks = fixture.nativeElement.querySelectorAll(
      '.external .nolist li a'
    );
    expect(externalLinks.length).toBe(2);
    expect(externalLinks[0].getAttribute('href')).toBe(
      'https://twitter.com/movie_twitter'
    );
    expect(externalLinks[1].getAttribute('href')).toBe(
      'https://www.imdb.com/title/tt1234567'
    );
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

  it('should render tv type with image, storyline, stats, and external links', fakeAsync(() => {
    component.type = 'tv';
    component.data = {
      name: 'Test TV Show',
      poster_path: '/poster1.jpg',
      overview: 'TV storyline',
      first_air_date: '2020-01-01',
      last_air_date: '2021-01-01',
      created_by: { name: 'Creator' },
      season_number: 2,
      genres: [{ id: '2', name: 'Drama' }],
      last_episode_to_air: { episode_number: 10 },
      status: 'Ended',
      languages: 'en',
    };
    component.externalData = { facebook_id: 'tv_facebook' };
    fixture.detectChanges();
    tick();

    const img = fixture.nativeElement.querySelector('.poster img');
    expect(img.getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w370_and_h556_bestv2//poster1.jpg'
    );
    expect(img.getAttribute('alt')).toBe('Test TV Show');

    const storyline = fixture.nativeElement.querySelector('.overview div');
    expect(storyline.textContent.trim()).toBe('TV storyline');

    const statsItems =
      fixture.nativeElement.querySelectorAll('.stats .nolist li');
    expect(statsItems.length).toBe(8);
    expect(statsItems[0].querySelector('.label').textContent).toBe(
      'First Aired'
    );
    expect(statsItems[0].querySelector('.value').textContent).toContain('2020');
    expect(statsItems[1].querySelector('.label').textContent).toBe(
      'Last Aired'
    );
    expect(statsItems[1].querySelector('.value').textContent).toContain('2021');
    expect(statsItems[2].querySelector('.label').textContent).toBe(
      'Created By'
    );
    expect(statsItems[2].querySelector('.value').textContent).toBe('Creator');
    expect(statsItems[3].querySelector('.label').textContent).toBe('Seasons');
    expect(statsItems[3].querySelector('.value').textContent).toBe('2');
    expect(statsItems[4].querySelector('.label').textContent).toBe('Genre');
    expect(statsItems[4].querySelector('a').textContent).toBe('Drama');
    expect(
      statsItems[4].querySelector('a').getAttribute('ng-reflect-router-link')
    ).toBe('/genres,2,tv');
    expect(statsItems[5].querySelector('.label').textContent).toBe('Episodes');
    expect(statsItems[5].querySelector('.value').textContent.trim()).toBe('10');
    expect(statsItems[6].querySelector('.label').textContent).toBe('Status');
    expect(statsItems[6].querySelector('.value').textContent).toBe('Ended');
    expect(statsItems[7].querySelector('.label').textContent).toBe('language');
    expect(statsItems[7].querySelector('.value').textContent).toBe('English');

    const externalLinks = fixture.nativeElement.querySelectorAll(
      '.external .nolist li a'
    );
    expect(externalLinks.length).toBe(1);
    expect(externalLinks[0].getAttribute('href')).toBe(
      'https://www.facebook.com/tv_facebook'
    );
  }));
});
