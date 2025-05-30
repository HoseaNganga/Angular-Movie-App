import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ListingComponent } from './listing.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

describe('ListingComponent', () => {
  let component: ListingComponent;
  let fixture: ComponentFixture<ListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([]), CommonModule, ListingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListingComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render title from title input if provided, else use name', fakeAsync(() => {
    component.title = 'Popular Movies';
    component.name = 'Fallback Name';
    fixture.detectChanges();
    tick();

    const titleElement = fixture.nativeElement.querySelector('.listing__title');
    expect(titleElement.textContent).toBe('Popular Movies');

    component.title = '';
    fixture.detectChanges();
    tick();

    expect(titleElement.textContent).toBe('Fallback Name');
  }));

  it('should render no items when items array is empty', fakeAsync(() => {
    component.items = [];
    fixture.detectChanges();
    tick();

    const itemElements = fixture.nativeElement.querySelectorAll('.card');
    expect(itemElements.length).toBe(0);
  }));

  it('should render items with links, images, titles, ratings, and votes', fakeAsync(() => {
    component.items = [
      {
        link: '/movie/1',
        imgSrc: 'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster1.jpg',
        title: 'Movie 1',
        rating: 75,
        vote: 7.5,
      },
      {
        link: '/movie/2',
        imgSrc: null,
        title: 'Movie 2',
        rating: 80,
        vote: 8.0,
      },
    ];
    component.title = 'Test Listing';
    fixture.detectChanges();
    tick();

    const itemElements = fixture.nativeElement.querySelectorAll('.card');
    expect(itemElements.length).toBe(2);

    // First item (with image)
    const firstLink = itemElements[0].querySelector('.card__link');
    expect(firstLink.getAttribute('ng-reflect-router-link')).toBe('/movie/1');
    const firstImg = itemElements[0].querySelector('.card__img img');
    expect(firstImg.getAttribute('src')).toBe(
      'https://image.tmdb.org/t/p/w370_and_h556_bestv2/poster1.jpg'
    );
    expect(firstImg.getAttribute('alt')).toBe('Movie 1');
    expect(itemElements[0].querySelector('.card__img span')).toBeNull();
    const firstTitle = itemElements[0].querySelector('.card__name');
    expect(firstTitle.textContent).toBe('Movie 1');
    const firstRating = itemElements[0].querySelector('.card__stars div');
    expect(firstRating.style.width).toBe('75%');
    const firstVote = itemElements[0].querySelector('.card__vote');
    expect(firstVote.textContent).toBe('7.5');

    // Second item (with SVG placeholder)
    const secondLink = itemElements[1].querySelector('.card__link');
    expect(secondLink.getAttribute('ng-reflect-router-link')).toBe('/movie/2');
    const secondImg = itemElements[1].querySelector('.card__img img');
    expect(secondImg).toBeNull();
    const secondSvg = itemElements[1].querySelector('.card__img span svg');
    expect(secondSvg).toBeTruthy();
    const secondTitle = itemElements[1].querySelector('.card__name');
    expect(secondTitle.textContent).toBe('Movie 2');
    const secondRating = itemElements[1].querySelector('.card__stars div');
    expect(secondRating.style.width).toBe('80%');
    const secondVote = itemElements[1].querySelector('.card__vote');
    expect(secondVote.textContent).toBe('8');
  }));
});
