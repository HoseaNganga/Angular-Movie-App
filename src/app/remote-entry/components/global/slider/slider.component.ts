import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, animate, style } from '@angular/animations';

@Component({
  selector: 'app-slider',
  imports: [CommonModule, RouterModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
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
export class SliderComponent {}
