import { Routes } from '@angular/router';
import { VitrineComponent } from './pages/vitrine.component';
import { BuscaComponent } from './pages/busca.component';
import { DetalheComponent } from './pages/detalhe.component';
import { CestaComponent } from './pages/cesta.component';
import { LoginComponent } from './pages/login.component';
import { CadastroComponent } from './pages/cadastro.component';

export const routes: Routes = [
  { path: '', component: VitrineComponent, title: 'PG Car | Vitrine' },
  { path: 'busca', component: BuscaComponent, title: 'PG Car | Busca' },
  { path: 'produto/:id', component: DetalheComponent, title: 'PG Car | Produto' },
  { path: 'cesta', component: CestaComponent, title: 'PG Car | Cesta' },
  { path: 'login', component: LoginComponent, title: 'PG Car | Entrar' },
  { path: 'cadastro', component: CadastroComponent, title: 'PG Car | Cadastro' },
  { path: '**', redirectTo: '' }
];
