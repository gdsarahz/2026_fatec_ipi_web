import { Component, Input, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Produto, emPromocao, precoVenda } from '../core/models';
import { CarrinhoService } from '../core/carrinho.service';

@Component({
  selector: 'app-card-produto',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <article class="card-pg">
      <a [routerLink]="['/produto', produto.codigo]" class="foto" [attr.aria-label]="'Ver detalhes de ' + produto.nome">
        @if (!semFoto()) {
          <img [src]="'/' + produto.codigo + '.png'" [alt]="produto.nome" class="img-fluid" (error)="semFoto.set(true)">
        } @else {
          <i class="bi bi-gear-wide-connected"></i>
        }
        @if (promo) { <span class="selo-promo">Promoção</span> }
      </a>
      <div class="corpo">
        <small class="cat">{{ produto.categoria }}</small>
        <h3>{{ produto.nome }}</h3>
        <div class="rodape">
          <div class="precos">
            @if (promo) { <small class="de"><s>{{ produto.valor | currency:'BRL' }}</s></small> }
            <strong class="preco">{{ preco | currency:'BRL' }}</strong>
          </div>
          @if (produto.quantidade > 0) {
            <button class="btn-pg" (click)="carrinho.adicionar(produto)">Comprar</button>
          } @else {
            <span class="esgotado">Sem estoque</span>
          }
        </div>
      </div>
    </article>
  `,
  styles: [`
    .card-pg { background: #fff; border: 1px solid #d9dce1; border-radius: 6px; overflow: hidden; height: 100%; display: flex; flex-direction: column; transition: border-color .15s; }
    .card-pg:hover { border-color: var(--pg-vermelho); }
    .foto { position: relative; background: var(--pg-aco); aspect-ratio: 4 / 3; display: grid; place-items: center; color: var(--pg-grafite); font-size: 4rem; }
    .foto img { object-fit: cover; width: 100%; height: 100%; }
    .selo-promo { position: absolute; top: .5rem; left: .5rem; background: var(--pg-vermelho); color: #fff; font-size: .75rem; font-weight: 600; padding: .15rem .5rem; border-radius: 3px; }
    .corpo { padding: .9rem 1rem 1rem; display: flex; flex-direction: column; gap: .25rem; flex: 1; }
    .cat { color: var(--pg-suave); }
    h3 { font-size: 1.35rem; margin: 0; flex: 1; }
    .rodape { display: flex; justify-content: space-between; align-items: center; gap: .5rem; margin-top: .6rem; }
    .precos { display: flex; flex-direction: column; line-height: 1.1; }
    .de { color: var(--pg-suave); }
    .preco { font-size: 1.2rem; }
    .esgotado { color: var(--pg-suave); font-weight: 600; font-size: .9rem; }
    @media (max-width: 575.98px) {
      .foto { font-size: 3rem; }
      .selo-promo { top: .35rem; left: .35rem; font-size: .65rem; padding: .1rem .4rem; }
      .corpo { padding: .6rem .7rem .75rem; }
      .cat { font-size: .75rem; }
      h3 { font-size: 1.05rem; margin-bottom: .25rem; }
      .rodape { flex-direction: column; align-items: stretch; gap: .5rem; }
      .preco { font-size: 1.1rem; }
      .rodape .btn-pg { width: 100%; padding: .4rem .5rem; }
      .esgotado { text-align: center; }
    }
  `]
})
export class CardProdutoComponent {
  @Input({ required: true }) produto!: Produto;
  carrinho = inject(CarrinhoService);
  semFoto = signal(false);

  get preco(): number { return precoVenda(this.produto); }
  get promo(): boolean { return emPromocao(this.produto); }
}
