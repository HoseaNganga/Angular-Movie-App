import { Routes } from '@angular/router';

export const remoteRoutes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'movie',
    loadComponent: () =>
      import('./components/movies/movies.component').then(
        (m) => m.MoviesComponent
      ),
  },
  {
    path: 'movie/category/:category',
    loadComponent: () =>
      import('./components/movie-category/movie-category.component').then(
        (m) => m.MovieCategoryComponent
      ),
  },
  {
    path: 'movie/:id',
    loadComponent: () =>
      import('./components/movies-info/movies-info.component').then(
        (m) => m.MoviesInfoComponent
      ),
  },
];
