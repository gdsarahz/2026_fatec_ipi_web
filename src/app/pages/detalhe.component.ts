import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { map, switchMap } from 'rxjs/operators';
import { ProdutoService, Produto } from '../core/produto.service';
import { CarrinhoService } from '../core/carrinho.service';

@Component({
  selector: 'app-detalhe',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="container pagina">
      @if (produto(); as p) {
        <div class="row g-4">
          <div class="col-12 col-md-5">
            <div class="foto">
              @if (p.imagem) { <img [src]="p.imagem" [alt]="p.nome" class="img-fluid"> }
              @else { <i [class]="'bi ' + p.icone"></i> }
            </div>
          </div>
          <div class="col-12 col-md-7">
            <small class="text-secondary">{{ p.categoria }}</small>
            <h1 class="nome">{{ p.nome }}</h1>
            <p>{{ p.descricao }}</p>
            <ul class="detalhes">
              @for (d of p.detalhes; track d) { <li>{{ d }}</li> }
            </ul>
            <p class="preco">{{ p.preco | currency:'BRL' }}</p>
            <button class="btn-pg btn-lg" (click)="comprar(p)">Comprar</button>
          </div>
        </div>
      } @else {
        <div class="vazio">
          Produto não encontrado. <a routerLink="/" class="fw-semibold text-danger">Voltar para a vitrine</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .foto { background: var(--pg-aco); aspect-ratio: 1; display: grid; place-items: center; font-size: 8rem; border: 1px solid #d9dce1; }
    .foto img { object-fit: cover; width: 100%; height: 100%; }
    .nome { font-size: 2.4rem; }
    .detalhes { padding-left: 1.2rem; }
    .preco { font-family: 'Barlow Condensed', sans-serif; font-size: 2.2rem; font-weight: 700; margin: 1rem 0 .5rem; }
  `]
})
export class DetalheComponent {
  private carrinho = inject(CarrinhoService);
  private router = inject(Router);
  private svc = inject(ProdutoService);
  produto = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map(p => Number(p.get('id'))),
      switchMap(id => this.svc.obter(id))
    )
  );

  comprar(p: Produto): void {
    this.carrinho.adicionar(p);
    this.router.navigate(['/cesta']);
  }
}
