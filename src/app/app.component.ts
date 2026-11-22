import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header.component';
import { CarrinhoService } from './core/carrinho.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header />
    <main><router-outlet /></main>
    <footer class="rodape">
      <div class="container">PG Car · Peças automotivas</div>
    </footer>
    @if (carrinho.aviso()) {
      <div class="toast-pg" role="status">{{ carrinho.aviso() }}</div>
    }
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; }
    main { flex: 1; }
    .rodape { background: var(--pg-grafite); color: #b8bcc4; padding: 1.25rem 0; text-align: center; font-size: .9rem; }
    .toast-pg { position: fixed; bottom: 1.25rem; right: 1.25rem; background: var(--pg-grafite); color: #fff;
      padding: .75rem 1.25rem; border-left: 5px solid var(--pg-vermelho); z-index: 2000; box-shadow: 0 6px 20px rgba(0,0,0,.25); }
    @media (max-width: 575.98px) { .toast-pg { left: 1rem; right: 1rem; bottom: 1rem; } }
  `]
})
export class AppComponent {
  carrinho = inject(CarrinhoService);
}