import { Routes } from '@angular/router';
import { Formulario } from './pages/formulario/formulario';

export const routes: Routes = [
  {
    path: 'orcamentos',
    component: Formulario
  },
  {
    path: '',
    redirectTo: 'orcamentos',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'orcamentos'
  }
];