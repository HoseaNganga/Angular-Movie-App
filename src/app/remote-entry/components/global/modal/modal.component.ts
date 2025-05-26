import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SafeUrlPipe } from '../pipes/Safe_Url/safe_url.pipe';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  imports: [CommonModule, SafeUrlPipe],
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  @Input() videoUrl: string | null = null;
  isVisible = false;

  openModal(videoUrl: string) {
    this.videoUrl = videoUrl;
    this.isVisible = true;
  }

  closeModal() {
    this.isVisible = false;
    this.videoUrl = null;
  }
}
