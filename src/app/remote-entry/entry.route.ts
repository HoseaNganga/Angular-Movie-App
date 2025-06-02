import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';

export const remoteRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./components/home/home.component').then(
            (m) => m.HomeComponent
          ),
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
      {
        path: 'tv',
        loadComponent: () =>
          import('./components/tv/tv.component').then((m) => m.TvComponent),
      },
      {
        path: 'tv/category/:category',
        loadComponent: () =>
          import('./components/tv-category/tv-category.component').then(
            (m) => m.TvCategoryComponent
          ),
      },
      {
        path: 'tv/:id',
        loadComponent: () =>
          import('./components/tv-info/tv-info.component').then(
            (m) => m.TvInfoComponent
          ),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./components/search/search.component').then(
            (m) => m.SearchComponent
          ),
      },
      {
        path: 'person/:id',
        loadComponent: () =>
          import('./components/person/person.component').then(
            (m) => m.PersonComponent
          ),
      },
      {
        path: 'genre',
        loadComponent: () =>
          import('./components/genre/genre.component').then(
            (m) => m.GenreComponent
          ),
      },
    ],
  },
];
