import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  imports: [CommonModule],
  styleUrl: './images.component.scss',
})
export class ImagesComponent {
  @Input() backdrops: any[] = [];
  @Input() posters: any[] = [];
  @Input() type: 'movie' | 'tv' | 'person' = 'movie';
}
