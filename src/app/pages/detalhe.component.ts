import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { ProdutoService } from '../core/produto.service';
import { Produto, caracteristicas, descricaoCurta, emPromocao, precoVenda } from '../core/models';
import { CarrinhoService } from '../core/carrinho.service';
import { mensagemErro } from '../core/http-erro';

interface EstadoDetalhe {
  status: 'carregando' | 'ok' | 'naoEncontrado' | 'erro';
  produto: Produto | null;
  erro: string;
}

@Component({
  selector: 'app-detalhe',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="container pagina">
      @let e = estado();
      @if (e.status === 'carregando') {
        <div class="vazio">Carregando produto...</div>
      } @else if (e.status === 'erro') {
        <div class="alert alert-warning">{{ e.erro }}</div>
      } @else if (e.produto; as p) {
        <div class="row g-4">
          <div class="col-12 col-md-5">
            <div class="foto">
              @if (!semFoto()) {
                <img [src]="'/' + p.codigo + '.png'" [alt]="p.nome" class="img-fluid" (error)="semFoto.set(true)">
              } @else {
                <i class="bi bi-gear-wide-connected"></i>
              }
            </div>
          </div>
          <div class="col-12 col-md-7">
            <small class="text-secondary">{{ p.categoria }}</small>
            <h1 class="nome">{{ p.nome }}</h1>
            <p>{{ descricao(p) }}</p>
            <ul class="detalhes">
              @for (d of itens(p); track d) { <li>{{ d }}</li> }
            </ul>
            <p class="preco">
              @if (promo(p)) { <small class="de">de: <s>{{ p.valor | currency:'BRL' }}</s></small><br>por: }
              {{ preco(p) | currency:'BRL' }}
            </p>
            @if (p.quantidade > 0) {
              <button class="btn-pg btn-lg" (click)="comprar(p)">Comprar</button>
            } @else {
              <p class="fw-semibold text-secondary">Produto sem estoque</p>
            }
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
    .preco { font-family: 'Barlow Condensed', sans-serif; font-size: 2.2rem; font-weight: 700; margin: 1rem 0 .5rem; line-height: 1.1; }
    .de { font-size: 1.2rem; font-weight: 500; color: var(--pg-suave); }
    @media (max-width: 575.98px) {
      .foto { font-size: 5rem; }
      .nome { font-size: 1.8rem; }
      .preco { font-size: 1.9rem; }
      .btn-pg.btn-lg { width: 100%; }
    }
  `]
})
export class DetalheComponent {
  private carrinho = inject(CarrinhoService);
  private router = inject(Router);
  private svc = inject(ProdutoService);
  semFoto = signal(false);

  estado = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map(p => Number(p.get('id'))),
      switchMap(id => this.carregar(id))
    ),
    { initialValue: { status: 'carregando', produto: null, erro: '' } as EstadoDetalhe }
  );

  descricao = descricaoCurta;
  itens = caracteristicas;
  preco = precoVenda;
  promo = emPromocao;

  private carregar(id: number): Observable<EstadoDetalhe> {
    return this.svc.obter(id).pipe(
      // o backend devolve um produto com codigo 0 quando o código não existe
      map((p): EstadoDetalhe => p && p.codigo > 0
        ? { status: 'ok', produto: p, erro: '' }
        : { status: 'naoEncontrado', produto: null, erro: '' }),
      catchError(e => of<EstadoDetalhe>({ status: 'erro', produto: null, erro: mensagemErro(e) })),
      startWith<EstadoDetalhe>({ status: 'carregando', produto: null, erro: '' })
    );
  }

  comprar(p: Produto): void {
    if (this.carrinho.adicionar(p)) this.router.navigate(['/cesta']);
  }
}
