import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Cadastro } from './pages/cadastro/cadastro'; 
import { Dashboard } from './pages/dashboard/dashboard'; 
import { Formulario } from './pages/formulario/formulario'; 
import { Preview } from './pages/preview/preview';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: '', component: Login},
  { path: 'cadastro', component: Cadastro },
  { path: 'dashboard', component: Dashboard },
  { path: 'orcamento', component: Formulario },
  { path: 'preview', component: Preview },
  { path: '**', component: NotFound }
];