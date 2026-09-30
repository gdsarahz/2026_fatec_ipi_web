import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Produto } from '../core/produto.service';
import { CarrinhoService } from '../core/carrinho.service';

@Component({
  selector: 'app-card-produto',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <article class="card-pg">
      <a [routerLink]="['/produto', produto.id]" class="foto" [attr.aria-label]="'Ver detalhes de ' + produto.nome">
        @if (produto.imagem) { <img [src]="produto.imagem" [alt]="produto.nome" class="img-fluid"> }
        @else { <i [class]="'bi ' + produto.icone"></i> }
      </a>
      <div class="corpo">
        <small class="cat">{{ produto.categoria }}</small>
        <h3>{{ produto.nome }}</h3>
        <div class="rodape">
          <strong class="preco">{{ produto.preco | currency:'BRL' }}</strong>
          <button class="btn-pg" (click)="carrinho.adicionar(produto)">Comprar</button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    
    .card-pg { background: #fff; border: 1px solid #d9dce1; border-radius: 6px; overflow: hidden; height: 100%; display: flex; flex-direction: column; transition: border-color .15s; }
    .card-pg:hover { border-color: var(--pg-vermelho); }
    .foto { background: var(--pg-aco); aspect-ratio: 4 / 3; display: grid; place-items: center; color: var(--pg-grafite); font-size: 4rem; }
    .foto img { object-fit: cover; width: 100%; height: 100%; }
    .corpo { padding: .9rem 1rem 1rem; display: flex; flex-direction: column; gap: .25rem; flex: 1; }
    .cat { color: var(--pg-suave); }
    h3 { font-size: 1.35rem; margin: 0; flex: 1; }
    .rodape { display: flex; justify-content: space-between; align-items: center; gap: .5rem; margin-top: .6rem; }
    .preco { font-size: 1.2rem; }
  `]
})
export class CardProdutoComponent {
  @Input({ required: true }) produto!: Produto;
  carrinho = inject(CarrinhoService);
}
