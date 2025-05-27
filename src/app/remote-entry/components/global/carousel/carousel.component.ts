import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  inject,
} from '@angular/core';
import { trigger, transition, animate, style } from '@angular/animations';
import { Subscription } from 'rxjs';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  imports: [RouterModule, CommonModule],
  styleUrls: ['./carousel.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class CarouselComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() title!: string;
  @Input() exploreLink!: string;
  @Input() items: any[] = [];
  @Input() canNavigateLeft = false;
  @Input() canNavigateRight = true;
  @Input() isDefaultCarousel = true;
  @Input() isExplore = true;

  @ViewChild('carouselContainer') carouselContainer!: ElementRef;

  private routerSubscription!: Subscription;
  private readonly _routerService = inject(Router);

  constructor() {
    window.addEventListener('resize', this.updateNavigation.bind(this));
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resetCarousel();
      this.updateNavigation();
    }, 300);

    this.routerSubscription = this._routerService.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.resetCarousel();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['items'] && !changes['items'].firstChange) {
      this.resetCarousel();
    }
  }

  prevSlide() {
    if (this.carouselContainer.nativeElement.scrollLeft > 0) {
      this.carouselContainer.nativeElement.scrollTo({
        left: this.carouselContainer.nativeElement.scrollLeft - 1000,
        behavior: 'smooth',
      });
      setTimeout(() => {
        this.updateNavigation();
      }, 300);
    }
  }

  nextSlide() {
    if (
      this.carouselContainer.nativeElement.scrollWidth >
      this.carouselContainer.nativeElement.scrollLeft +
        this.carouselContainer.nativeElement.clientWidth
    ) {
      this.carouselContainer.nativeElement.scrollTo({
        left: this.carouselContainer.nativeElement.scrollLeft + 1000,
        behavior: 'smooth',
      });
      setTimeout(() => {
        this.updateNavigation();
      }, 300);
    }
  }

  private updateNavigation() {
    const container = this.carouselContainer.nativeElement;
    const tolerance = 5;
    this.canNavigateLeft = container.scrollLeft > 0;
    this.canNavigateRight =
      container.scrollWidth >
      container.scrollLeft + container.clientWidth + tolerance;
  }

  private resetCarousel() {
    if (this.carouselContainer) {
      this.carouselContainer.nativeElement.scrollTo({
        left: 0,
        behavior: 'smooth',
      });

      setTimeout(() => {
        this.updateNavigation();
      }, 300);
    } else {
      console.warn('Carousel container not found.');
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    window.removeEventListener('resize', this.updateNavigation.bind(this));
  }
}
