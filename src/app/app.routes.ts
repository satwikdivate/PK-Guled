import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Routes } from '@angular/router';
import { ContentService } from './core/content.service';
import { AboutConfig, Catalog, HomeConfig } from './core/models';

const homeResolver: ResolveFn<HomeConfig> = () => inject(ContentService).home$();
const aboutResolver: ResolveFn<AboutConfig> = () => inject(ContentService).about$();
const catalogResolver: ResolveFn<Catalog | null> = (route: ActivatedRouteSnapshot) =>
  inject(ContentService).catalog$(route.paramMap.get('slug') ?? '');

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    resolve: { home: homeResolver },
  },
  {
    path: 'collections',
    loadComponent: () =>
      import('./features/collections/collections.component').then((m) => m.CollectionsComponent),
  },
  {
    path: 'collections/:slug',
    loadComponent: () =>
      import('./features/category/category-page.component').then((m) => m.CategoryPageComponent),
    resolve: { catalog: catalogResolver },
    runGuardsAndResolvers: 'paramsChange',
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent),
    resolve: { about: aboutResolver },
  },
  {
    path: 'visit',
    loadComponent: () => import('./features/visit/visit.component').then((m) => m.VisitComponent),
    resolve: { home: homeResolver },
  },
  {
    path: '404',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
