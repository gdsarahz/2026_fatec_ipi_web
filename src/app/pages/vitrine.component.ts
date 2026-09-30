import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProdutoService } from '../core/produto.service';
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
      <div class="row g-3 g-lg-4">
        @for (p of produtos(); track p.id) {
          <div class="col-12 col-sm-6 col-lg-4 col-xl-3"><app-card-produto [produto]="p" /></div>
        }
      </div>
    </div>
  `,
  styles: [`
    .destaque { background: repeating-linear-gradient(-45deg, #23272e 0 18px, #1d2127 18px 36px); color: #fff; padding: 2.5rem 0; }
    .destaque h1 { font-size: clamp(2rem, 5vw, 3.2rem); margin: 0 0 .25rem; }
    .destaque p { margin: 0; color: #c9ccd1; font-size: 1.1rem; }
    .pagina { padding-top: 2rem; }
  `]
})
export class VitrineComponent {
  produtos = toSignal(inject(ProdutoService).listar(), { initialValue: [] });
}
