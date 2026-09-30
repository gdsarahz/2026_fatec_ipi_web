import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProdutoService } from '../core/produto.service';
import { CarrinhoService } from '../core/carrinho.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule],
  template: `
    <header class="topo">
      <div class="container topo-linha">
        <a routerLink="/" class="logo">
          <img src="/logo.png" alt="Logo da Loja" height="80" />
        </a>

        <form class="busca" (submit)="$event.preventDefault(); buscar()" role="search">
          <input class="form-control" type="search" [formControl]="termo"
                 placeholder="Buscar produto, ex.: pastilha" aria-label="Buscar produtos">
          <button class="btn-pg" type="submit">OK</button>
        </form>

        <div class="acoes">
          <a routerLink="/cesta" class="acao" aria-label="Carrinho">
            <i class="bi bi-basket3"></i>
            @if (carrinho.quantidade() > 0) { <span class="selo">{{ carrinho.quantidade() }}</span> }
          </a>
          @if (auth.usuario(); as u) {
            <button class="acao usuario" (click)="auth.sair()" title="Sair">
              <i class="bi bi-person-check-fill"></i>
              <small>{{ u.nome.split(' ')[0] }} · sair</small>
            </button>
          } @else {
            <a routerLink="/login" class="acao" aria-label="Entrar ou cadastrar"><i class="bi bi-person-circle"></i></a>
          }
        </div>
      </div>

      <nav class="menu" aria-label="Categorias">
        <div class="container">
          <button class="menu-toggle" (click)="aberto.set(!aberto())" [attr.aria-expanded]="aberto()">
            <i class="bi bi-list"></i> Menu
          </button>
          <ul [class.aberto]="aberto()" (click)="aberto.set(false)">
            <li><a routerLink="/" routerLinkActive="ativo" [routerLinkActiveOptions]="{exact: true}">Início</a></li>
            @for (c of produtos.categorias; track c) {
              <li><a routerLink="/busca" [queryParams]="{ cat: c }">{{ c }}</a></li>
            }
          </ul>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .topo { background: var(--pg-grafite); color: #fff; position: sticky; top: 0; z-index: 1000; }
    .topo-linha { display: flex; align-items: center; gap: 1rem; padding: .8rem 12px; }
    .logo { display: flex; align-items: center; gap: .5rem; font-family: 'Barlow Condensed', sans-serif; font-size: 1.9rem; font-weight: 700; line-height: 1; }
    .logo i { color: var(--pg-vermelho); font-size: 1.7rem; }
    .logo b { color: var(--pg-vermelho); margin-left: .25rem; }
    .busca { flex: 1; display: flex; gap: .4rem; max-width: 640px; margin: 0 auto; }
    .busca .btn-pg { padding: .4rem 1rem; }
    .acoes { display: flex; align-items: center; gap: .9rem; }
    .acao { position: relative; color: #fff; font-size: 1.6rem; background: none; border: 0; padding: 0; display: flex; align-items: center; gap: .4rem; }
    .acao:hover { color: var(--pg-vermelho); }
    .usuario small { font-size: .8rem; font-family: 'Barlow', sans-serif; }
    .selo { position: absolute; top: -8px; right: -10px; background: var(--pg-vermelho); color: #fff; font-size: .7rem;
      min-width: 18px; height: 18px; border-radius: 9px; display: grid; place-items: center; font-weight: 600; }
    .menu { background: #2b3038; border-top: 3px solid var(--pg-vermelho); }
    .menu ul { list-style: none; margin: 0; padding: 0; display: flex; justify-content: center; flex-wrap: wrap; }
    .menu a { display: block; padding: .7rem 1.1rem; color: #e8eaed; font-weight: 500; }
    .menu a:hover, .menu a.ativo { background: var(--pg-vermelho); color: #fff; }
    .menu-toggle { display: none; background: none; border: 0; color: #fff; padding: .6rem 0; font-weight: 600; }
    @media (max-width: 767px) {
      .topo-linha { flex-wrap: wrap; }
      .busca { order: 3; flex-basis: 100%; max-width: none; }
      .acoes { margin-left: auto; }
      .menu-toggle { display: block; }
      .menu ul { display: none; flex-direction: column; }
      .menu ul.aberto { display: flex; }
      .usuario small { display: none; }
    }
  `]
})
export class HeaderComponent {
  produtos = inject(ProdutoService);
  carrinho = inject(CarrinhoService);
  auth = inject(AuthService);
  private router = inject(Router);
  termo = new FormControl('', { nonNullable: true });
  aberto = signal(false);

  buscar(): void {
    const q = this.termo.value.trim();
    if (q) this.router.navigate(['/busca'], { queryParams: { q } });
  }
}
