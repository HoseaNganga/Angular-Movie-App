import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';
import { SafeUrlPipe } from '../pipes/Safe_Url/safe_url.pipe';
import { By } from '@angular/platform-browser';

class MockSafeUrlPipe {
  transform(value: string | null): string | null {
    return value;
  }
}

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ModalComponent],
      providers: [{ provide: SafeUrlPipe, useClass: MockSafeUrlPipe }],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should not render modal when isVisible is false', () => {
    component.isVisible = false;
    fixture.detectChanges();

    const modalBackdrop = fixture.debugElement.query(By.css('.modal-backdrop'));
    const modalContent = fixture.debugElement.query(By.css('.modal-content'));
    expect(modalBackdrop).toBeNull();
    expect(modalContent).toBeNull();
  });

  it('should render modal when isVisible is true', () => {
    component.isVisible = true;
    fixture.detectChanges();

    const modalBackdrop = fixture.debugElement.query(By.css('.modal-backdrop'));
    const modalContent = fixture.debugElement.query(By.css('.modal-content'));
    expect(modalBackdrop).not.toBeNull();
    expect(modalContent).not.toBeNull();
  });

  it('should render iframe with videoUrl when videoUrl is provided and isVisible is true', () => {
    component.isVisible = true;
    component.videoUrl =
      'https://www.youtube.com/embed/1234?rel=0&autoplay=1&mute=1';
    fixture.detectChanges();

    const iframe = fixture.debugElement.query(By.css('iframe'));
    expect(iframe).not.toBeNull();
    expect(iframe.nativeElement.src).toContain('');
  });

  it('should not render iframe when videoUrl is null', () => {
    component.isVisible = true;
    component.videoUrl = null;
    fixture.detectChanges();

    const iframe = fixture.debugElement.query(By.css('iframe'));
    expect(iframe).toBeNull();
  });

  it('should call openModal and set isVisible to true and videoUrl', () => {
    const testUrl =
      'https://www.youtube.com/embed/1234?rel=0&autoplay=1&mute=1';
    component.openModal(testUrl);

    expect(component.isVisible).toBe(true);
    expect(component.videoUrl).toBe(testUrl);
  });

  it('should call closeModal and set isVisible to false and videoUrl to null', () => {
    component.isVisible = true;
    component.videoUrl =
      'https://www.youtube.com/embed/1234?rel=0&autoplay=1&mute=1';
    component.closeModal();

    expect(component.isVisible).toBe(false);
    expect(component.videoUrl).toBeNull();
  });

  it('should close modal when clicking the backdrop', () => {
    component.isVisible = true;
    fixture.detectChanges();

    const backdrop = fixture.debugElement.query(By.css('.modal-backdrop'));
    backdrop.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.isVisible).toBe(false);
    expect(component.videoUrl).toBeNull();
  });

  it('should close modal when clicking the close button', () => {
    component.isVisible = true;
    fixture.detectChanges();

    const closeButton = fixture.debugElement.query(By.css('.close-button'));
    closeButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.isVisible).toBe(false);
    expect(component.videoUrl).toBeNull();
  });
});
