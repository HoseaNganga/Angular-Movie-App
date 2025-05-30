import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { VideosComponent } from './videos.component';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { Component, Input } from '@angular/core';

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

describe('VideosComponent', () => {
  let component: VideosComponent;
  let fixture: ComponentFixture<VideosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, VideosComponent, MockModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VideosComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render no items when videosData is empty', fakeAsync(() => {
    component.videosData = [];
    fixture.detectChanges();
    tick();

    const items = fixture.nativeElement.querySelectorAll('.item');
    expect(items.length).toBe(0);
  }));

  it('should render up to 12 video items with correct image, name, type, and click handler', fakeAsync(() => {
    component.videosData = [
      { key: 'abc123', name: 'Trailer 1', type: 'Trailer' },
      { key: 'def456', name: 'Teaser 1', type: 'Teaser' },
      { key: 'ghi789', name: 'Clip 1', type: 'Clip' },
      ...Array(10).fill({ key: 'xyz000', name: 'Extra', type: 'Extra' }),
    ];
    component.videoTypes = ['Trailer', 'Teaser', 'Clip'];
    fixture.detectChanges();
    tick();

    const items = fixture.nativeElement.querySelectorAll('.item');
    expect(items.length).toBe(12);

    const firstItem = items[0];
    expect(firstItem.querySelector('img').getAttribute('src')).toBe(
      'https://img.youtube.com/vi/def456/mqdefault.jpg'
    );
    expect(firstItem.querySelector('.name').textContent).toBe('Teaser 1');
    expect(firstItem.querySelector('.type').textContent).toBe('Teaser');

    const secondItem = items[1];
    expect(secondItem.querySelector('img').getAttribute('src')).toBe(
      'https://img.youtube.com/vi/ghi789/mqdefault.jpg'
    );
    expect(secondItem.querySelector('.name').textContent).toBe('Clip 1');
    expect(secondItem.querySelector('.type').textContent).toBe('Clip');

    jest.spyOn(component, 'openVideoModal');
    firstItem.querySelector('.link').click();
    tick();
    expect(component.openVideoModal).toHaveBeenCalledWith('def456');
  }));

  it('should open modal with correct YouTube URL when openVideoModal is called', fakeAsync(() => {
    component.videosData = [
      { key: 'abc123', name: 'Trailer 1', type: 'Trailer' },
    ];
    fixture.detectChanges();
    tick();

    const modal = fixture.debugElement.query(
      By.css('app-modal')
    ).componentInstance;
    jest.spyOn(modal, 'openModal');
    component.openVideoModal('abc123');
    tick();

    expect(modal.openModal).toHaveBeenCalledWith(
      'https://www.youtube.com/embed/abc123?rel=0&autoplay=1&mute=1'
    );
  }));
});
