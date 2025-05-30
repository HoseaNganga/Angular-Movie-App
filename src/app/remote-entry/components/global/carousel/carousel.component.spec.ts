import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import {
  RouterModule,
  Router,
  NavigationEnd,
  ActivatedRoute,
} from '@angular/router';
import { CarouselComponent } from './carousel.component';
import { By } from '@angular/platform-browser';
import { Subject, Subscription } from 'rxjs';
import { ElementRef, SimpleChanges } from '@angular/core';

// Mock Router
class MockRouter {
  events = new Subject();
  navigate = jest.fn();
  createUrlTree = jest.fn().mockReturnValue('/some-path');
  serializeUrl = jest.fn().mockReturnValue('/some-path');
}

describe('CarouselComponent', () => {
  let component: CarouselComponent;
  let fixture: ComponentFixture<CarouselComponent>;
  let mockRouter: MockRouter;
  let mockElementRef: { nativeElement: any };

  beforeEach(async () => {
    mockElementRef = {
      nativeElement: {
        scrollLeft: 0,
        scrollWidth: 2000,
        clientWidth: 1000,
        scrollTo: jest.fn(),
      },
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, CarouselComponent],

      providers: [
        { provide: Router, useClass: MockRouter },
        { provide: ElementRef, useValue: mockElementRef },
        { provide: ActivatedRoute, useValue: { snapshot: { data: {} } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CarouselComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as any;
    component.carouselContainer = mockElementRef as any;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and items', () => {
    component.title = 'Top Movies';
    component.items = [
      {
        title: 'Movie 1',
        imgSrc: '/path1.jpg',
        rating: 80,
        vote: 1000,
        link: '/movie/1',
      },
      {
        title: 'Movie 2',
        imgSrc: '/path2.jpg',
        rating: 90,
        vote: 2000,
        link: '/movie/2',
      },
    ];
    fixture.detectChanges();

    const title = fixture.debugElement.query(By.css('.listing__title'));
    const cards = fixture.debugElement.queryAll(By.css('.card'));
    expect(title.nativeElement.textContent).toContain('Top Movies');
    expect(cards.length).toBe(3);
    expect(cards[0].query(By.css('img')).nativeElement.src).toContain(
      '/path1.jpg'
    );
    expect(
      cards[0].query(By.css('.card__name')).nativeElement.textContent
    ).toContain('Movie 1');
  });

  it('should render Explore All link when isDefaultCarousel is true and isExplore is false', () => {
    component.isDefaultCarousel = true;
    component.isExplore = false;
    component.exploreLink = '/explore';
    fixture.detectChanges();

    const exploreLink = fixture.debugElement.query(By.css('.listing__explore'));
    expect(exploreLink).not.toBeNull();
    expect(
      exploreLink.nativeElement.getAttribute('ng-reflect-router-link')
    ).toContain('/explore');
  });

  it('should not render Explore All link when isExplore is true', () => {
    component.isDefaultCarousel = true;
    component.isExplore = true;
    fixture.detectChanges();

    const exploreLink = fixture.debugElement.query(By.css('.listing__explore'));
    expect(exploreLink).toBeNull();
  });

  it('should render cast details when isCastCarousel is true', () => {
    component.isCastCarousel = true;
    component.items = [
      { name: 'Actor 1', character: 'Hero', link: '/actor/1' },
    ];
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.css('.card'));
    const name = card.query(By.css('.credits-item__name'));
    const character = card.query(By.css('.credits-item__character'));
    expect(name.nativeElement.textContent).toContain('Actor 1');
    expect(character.nativeElement.textContent).toContain('Hero');
  });

  it('should call prevSlide and scroll left', () => {
    const mockElementRef = {
      nativeElement: {
        scrollLeft: 1000,
        clientWidth: 1000,
        scrollWidth: 2000,
        scrollTo: jest.fn(),
      },
    } as ElementRef;

    component.carouselContainer = mockElementRef;
    fixture.detectChanges();

    const prevButton = fixture.debugElement.query(
      By.css('.carousel__nav--left')
    );
    expect(prevButton).toBeTruthy();

    prevButton.triggerEventHandler('click', null);

    expect(mockElementRef.nativeElement.scrollTo).toHaveBeenCalledWith({
      left: 0,
      behavior: 'smooth',
    });
  });

  it('should call nextSlide and scroll right', () => {
    const mockElementRef = {
      nativeElement: {
        scrollLeft: 0,
        clientWidth: 1000,
        scrollWidth: 2000,
        scrollTo: jest.fn(),
      },
    } as ElementRef;

    component.carouselContainer = mockElementRef;
    component.canNavigateRight = true;

    fixture.detectChanges();

    const nextButton = fixture.debugElement.query(
      By.css('.carousel__nav--right')
    );
    expect(nextButton).toBeTruthy();

    nextButton.triggerEventHandler('click', null);

    expect(mockElementRef.nativeElement.scrollTo).toHaveBeenCalledWith({
      left: 1000,
      behavior: 'smooth',
    });
  });

  it('should disable prev button when canNavigateLeft is false', () => {
    component.canNavigateLeft = false;
    fixture.detectChanges();

    const prevButton = fixture.debugElement.query(
      By.css('.carousel__nav--left')
    );
    expect(prevButton.attributes['disabled']).toBe('true');
  });

  it('should disable next button when canNavigateRight is false', () => {
    component.canNavigateRight = false;
    fixture.detectChanges();

    const nextButton = fixture.debugElement.query(
      By.css('.carousel__nav--right')
    );
    expect(nextButton.attributes['disabled']).toBe('true');
  });

  it('should update navigation on window resize', () => {
    const mockElementRef = {
      nativeElement: {
        scrollLeft: 500,
        scrollWidth: 2000,
        clientWidth: 1000,
      },
    } as ElementRef;

    component.carouselContainer = mockElementRef;

    window.dispatchEvent(new Event('resize'));

    expect(component.canNavigateLeft).toBe(true);
    expect(component.canNavigateRight).toBe(true);
  });

  it('should reset carousel on navigation end', fakeAsync(() => {
    component.carouselContainer = mockElementRef as any;
    component.ngAfterViewInit();
    mockRouter.events.next(new NavigationEnd(1, '/new-route', '/new-route'));
    tick(300);

    expect(mockElementRef.nativeElement.scrollTo).toHaveBeenCalledWith({
      left: 0,
      behavior: 'smooth',
    });
    expect(component.canNavigateLeft).toBe(false);
    expect(component.canNavigateRight).toBe(true);
  }));

  it('should reset carousel on items change', () => {
    component.carouselContainer = mockElementRef as any;
    component.ngAfterViewInit();
    const changes: SimpleChanges = {
      items: {
        previousValue: [],
        currentValue: [{ title: 'Movie 1' }],
        firstChange: false,
        isFirstChange: () => false,
      },
    };

    component.ngOnChanges(changes);
    expect(mockElementRef.nativeElement.scrollTo).toHaveBeenCalledWith({
      left: 0,
      behavior: 'smooth',
    });
  });

  it('should unsubscribe from router events and remove resize listener on ngOnDestroy', () => {
    const unsubscribeSpy = jest.fn();
    component['routerSubscription'] = {
      unsubscribe: unsubscribeSpy,
    } as unknown as Subscription;
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });
});
