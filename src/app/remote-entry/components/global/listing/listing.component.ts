import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  imports: [RouterModule, CommonModule],
  styleUrl: './listing.component.scss',
})
export class ListingComponent {
  @Input() title!: string;
  @Input() items: any[] = [];
  @Input() name!: string;
}
