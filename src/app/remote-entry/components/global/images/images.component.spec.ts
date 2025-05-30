import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ImagesComponent } from './images.component';

describe('ImagesComponent', () => {
  let component: ImagesComponent;
  let fixture: ComponentFixture<ImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ImagesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImagesComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.backdrops).toEqual([]);
    expect(component.posters).toEqual([]);
    expect(component.type).toBe('movie');
  });

  it('should render nothing when both backdrops and posters are empty', () => {
    component.backdrops = [];
    component.posters = [];
    component.type = 'movie';
    fixture.detectChanges();

    const backdropSection = fixture.nativeElement.querySelector('.head');
    expect(backdropSection).toBeNull();
  });

  describe('Backdrops Section', () => {
    const mockBackdrops = [
      { file_path: '/backdrop1.jpg' },
      { file_path: '/backdrop2.jpg' },
      { file_path: '/backdrop3.jpg' },
      { file_path: null }, // Test missing file_path
    ];

    it('should render backdrops section when backdrops array has items', () => {
      component.backdrops = mockBackdrops;
      component.type = 'movie';
      fixture.detectChanges();

      const backdropTitle = fixture.nativeElement.querySelector('.title');
      expect(backdropTitle).toBeTruthy();
      expect(backdropTitle.textContent.trim()).toBe('Backdrops');
    });

    it('should display correct count of backdrop images (slice 1:13)', () => {
      const manyBackdrops = Array.from({ length: 15 }, (_, i) => ({
        file_path: `/backdrop${i}.jpg`,
      }));
      component.backdrops = manyBackdrops;
      fixture.detectChanges();

      const countElement = fixture.nativeElement.querySelector('.count');
      expect(countElement.textContent.trim()).toBe('12 Images');
    });

    it('should render backdrop images with correct src attributes', () => {
      component.backdrops = mockBackdrops;
      fixture.detectChanges();

      const backdropImages =
        fixture.nativeElement.querySelectorAll('.backdrop img');
      expect(backdropImages.length).toBe(2);

      expect(backdropImages[0].getAttribute('src')).toBe(
        'https://image.tmdb.org/t/p/w533_and_h300_bestv2//backdrop2.jpg'
      );
      expect(backdropImages[1].getAttribute('src')).toBe(
        'https://image.tmdb.org/t/p/w533_and_h300_bestv2//backdrop3.jpg'
      );
    });

    it('should render SVG placeholder for backdrops without file_path', () => {
      component.backdrops = [
        { file_path: '/backdrop1.jpg' },
        { file_path: null },
        { file_path: undefined },
      ];
      fixture.detectChanges();

      const svgElements =
        fixture.nativeElement.querySelectorAll('.backdrop svg');
      expect(svgElements.length).toBe(2); // Two items without file_path
    });

    it('should apply correct CSS classes to backdrop items', () => {
      component.backdrops = mockBackdrops;
      fixture.detectChanges();

      const backdropItems =
        fixture.nativeElement.querySelectorAll('.item.backdrop');
      expect(backdropItems.length).toBe(3); // slice(1:13) from 4 items = 3 items
    });

    describe('Posters Section', () => {
      const mockPosters = [
        { full_path: 'https://example.com/poster1.jpg' },
        { full_path: 'https://example.com/poster2.jpg' },
        { full_path: null },
        { full_path: 'https://example.com/poster3.jpg' },
      ];

      it('should render posters section when posters array has items', () => {
        component.posters = mockPosters;
        component.type = 'movie';
        fixture.detectChanges();

        const posterTitles = fixture.nativeElement.querySelectorAll('.title');
        const posterTitle = Array.from(posterTitles).find(
          (title: any) => title.textContent?.trim() === 'Posters'
        );
        expect(posterTitle).toBeTruthy();
      });

      it('should display correct count of poster images (slice 1:20)', () => {
        // Create array with 25 items to test slicing
        const manyPosters = Array.from({ length: 25 }, (_, i) => ({
          full_path: `https://example.com/poster${i}.jpg`,
        }));
        component.posters = manyPosters;
        fixture.detectChanges();

        const countElements = fixture.nativeElement.querySelectorAll('.count');
        const posterCount = Array.from(countElements).find((count: any) =>
          count.textContent?.includes('19 Images')
        );
        expect(posterCount).toBeTruthy(); // slice(1:20) = 19 items
      });

      it('should render poster images with correct src attributes', () => {
        component.posters = mockPosters;
        fixture.detectChanges();

        const posterImages =
          fixture.nativeElement.querySelectorAll('.poster img');
        expect(posterImages.length).toBe(2); // Only items with full_path

        expect(posterImages[0].getAttribute('src')).toBe(
          'https://example.com/poster2.jpg'
        );
        expect(posterImages[1].getAttribute('src')).toBe(
          'https://example.com/poster3.jpg'
        );
      });

      it('should render SVG placeholder for posters without full_path', () => {
        component.posters = [
          { full_path: 'https://example.com/poster1.jpg' },
          { full_path: null },
          { full_path: undefined },
        ];
        fixture.detectChanges();

        const svgElements =
          fixture.nativeElement.querySelectorAll('.poster svg');
        expect(svgElements.length).toBe(2); // Two items without full_path
      });

      it('should apply correct CSS classes to poster items', () => {
        component.posters = mockPosters;
        fixture.detectChanges();

        const posterItems =
          fixture.nativeElement.querySelectorAll('.item.poster');
        expect(posterItems.length).toBe(3); // slice(1:20) from 4 items = 3 items
      });
    });

    describe('Edge cases', () => {
      it('should handle empty arrays gracefully', () => {
        component.backdrops = [];
        component.posters = [];
        fixture.detectChanges();

        const titles = fixture.nativeElement.querySelectorAll('.title');
        expect(titles.length).toBe(0);
      });

      it('should handle arrays with only one item (testing slice behavior)', () => {
        component.backdrops = [{ file_path: '/single.jpg' }];
        fixture.detectChanges();

        const backdropItems =
          fixture.nativeElement.querySelectorAll('.backdrop');
        expect(backdropItems.length).toBe(0);
      });
    });
  });
});
