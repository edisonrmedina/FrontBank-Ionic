import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'products',
    loadComponent: () =>
      import('./features/product-list/product-list.page').then((m) => m.ProductListPage),
  },
  {
    path: 'products/new',
    loadComponent: () =>
      import('./features/product-form/product-form.page').then((m) => m.ProductFormPage),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/product-detail/product-detail.page').then((m) => m.ProductDetailPage),
  },
  {
    path: 'products/:id/edit',
    loadComponent: () =>
      import('./features/product-form/product-form.page').then((m) => m.ProductFormPage),
  },
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'products',
  },
];
