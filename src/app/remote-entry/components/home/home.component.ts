import { Component, inject, OnInit } from '@angular/core';
import { MovieService } from '../../../services/movie.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly _movieService = inject(MovieService);

  ngOnInit(): void {
    this._movieService.getNowPlaying();
  }
}
