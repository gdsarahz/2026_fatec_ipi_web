import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProdutoService } from '../core/produto.service';
import { Produto } from '../core/models';
import { mensagemErro } from '../core/http-erro';
import { CardProdutoComponent } from '../shared/card-produto.component';

@Component({
  selector: 'app-vitrine',
  standalone: true,
  imports: [CardProdutoComponent],
  template: `
    <section class="destaque">
      <div class="container">
        <h1>A peça que falta para o seu veículo ir mais longe.</h1>
        <p>Maçanetas externas, maçanetas internas, fechaduras, lanternas e coxim.</p>
      </div>
    </section>
    <div class="container pagina">
      @if (carregando()) {
        <div class="vazio">Carregando produtos...</div>
      } @else if (erro()) {
        <div class="alert alert-warning">{{ erro() }}</div>
      } @else if (!produtos().length) {
        <div class="vazio">Não existem produtos na vitrine.</div>
      } @else {
        <div class="row g-3 g-lg-4">
          @for (p of produtos(); track p.codigo) {
            <div class="col-6 col-md-4 col-xl-3"><app-card-produto [produto]="p" /></div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .destaque { background: repeating-linear-gradient(-45deg, #23272e 0 18px, #1d2127 18px 36px); color: #fff; padding: 2.5rem 0; }
    .destaque h1 { font-size: clamp(2rem, 5vw, 3.2rem); margin: 0 0 .25rem; }
    .destaque p { margin: 0; color: #c9ccd1; font-size: 1.1rem; }
    @media (max-width: 575.98px) { .destaque { padding: 1.5rem 0; } .destaque p { font-size: 1rem; } }
    .pagina { padding-top: 2rem; }
  `]
})
export class VitrineComponent {
  produtos = signal<Produto[]>([]);
  carregando = signal(true);
  erro = signal('');

  constructor() {
    inject(ProdutoService).vitrine().pipe(takeUntilDestroyed()).subscribe({
      next: lista => { this.produtos.set(lista); this.carregando.set(false); },
      error: e => { this.erro.set(mensagemErro(e)); this.carregando.set(false); }
    });
  }
}
