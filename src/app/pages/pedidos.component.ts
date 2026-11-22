import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../core/auth.service';
import { PedidoService } from '../core/pedido.service';
import { ProdutoService } from '../core/produto.service';
import { Pedido, paraData } from '../core/models';
import { mensagemErro } from '../core/http-erro';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="container pagina">
      <h1>Meus pedidos</h1>
      @if (carregando()) {
        <div class="vazio">Carregando pedidos...</div>
      } @else if (erro()) {
        <div class="alert alert-warning">{{ erro() }}</div>
      } @else if (!lista().length) {
        <div class="vazio">Você ainda não tem pedidos. <a routerLink="/" class="fw-semibold text-danger">Ver peças</a></div>
      } @else {
        <div class="table-responsive">
          <table class="table table-hover tabela align-middle bg-white">
            <thead>
              <tr>
                <th>Pedido</th><th>Data</th><th class="d-none d-md-table-cell">Entrega</th><th class="text-center">Itens</th>
                <th class="text-end">Valor total</th><th></th>
              </tr>
            </thead>
            <tbody>
              @for (p of lista(); track p.codigoPedido) {
                <tr class="linha">
                  <th scope="row" class="c-num">#{{ p.codigoPedido }}</th>
                  <td class="c-data">{{ data(p) | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="d-none d-md-table-cell">{{ p.entrega }}</td>
                  <td class="text-center c-itens"><span class="badge bg-secondary">{{ p.itens.length }} {{ p.itens.length === 1 ? 'item' : 'itens' }}</span></td>
                  <td class="text-end fw-bold c-valor">{{ p.valorTotal | currency:'BRL' }}</td>
                  <td class="text-end c-acao">
                    <button class="btn btn-sm btn-outline-dark" (click)="alternar(p.codigoPedido)"
                            [attr.aria-expanded]="aberto(p.codigoPedido)">
                      {{ aberto(p.codigoPedido) ? 'Ocultar' : 'Ver itens' }}
                    </button>
                  </td>
                </tr>
                @if (aberto(p.codigoPedido)) {
                  <tr class="detalhe-pedido">
                    <td colspan="6">
                      @for (i of p.itens; track i.codigoItemPedido) {
                        <div class="d-flex justify-content-between gap-3">
                          <span>{{ i.quantidade }}x {{ nome(i.codigoProduto) }}</span>
                          <span class="text-nowrap">{{ i.valor * i.quantidade | currency:'BRL' }}</span>
                        </div>
                      }
                      @if (p.obs) { <div class="text-secondary mt-2"><small>Obs.: {{ p.obs }}</small></div> }
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .detalhe-pedido td { background: var(--pg-aco); }
    @media (max-width: 575.98px) {
      .tabela thead { display: none; }
      .tabela, .tabela tbody { display: block; }
      .tabela tbody tr.linha { display: grid; grid-template-columns: auto 1fr auto;
        grid-template-areas: 'num itens valor' 'data data acao';
        gap: .4rem .75rem; align-items: center; padding: .75rem; border-top: 1px solid #dee2e6; }
      .tabela tbody td, .tabela tbody th { display: block; padding: 0; border: 0; box-shadow: none; background: transparent; }
      .c-num { grid-area: num; font-size: 1.1rem; }
      .c-itens { grid-area: itens; text-align: left !important; }
      .c-valor { grid-area: valor; font-size: 1.1rem; }
      .c-data { grid-area: data; color: var(--pg-suave); font-size: .9rem; }
      .c-acao { grid-area: acao; }
      .tabela tbody tr.detalhe-pedido { display: block; background: var(--pg-aco); padding: .5rem .75rem .75rem; }
      .tabela tbody tr.detalhe-pedido td { padding: 0; }
    }
  `]
})
export class PedidosComponent {
  private produtos = inject(ProdutoService);

  lista = signal<Pedido[]>([]);
  carregando = signal(true);
  erro = signal('');
  private nomes = signal<Record<number, string>>({});
  private abertos = signal<number[]>([]);

  constructor() {
    const cliente = inject(AuthService).usuario();
    if (!cliente) { this.carregando.set(false); return; }   // a rota já exige login
    inject(PedidoService).listarPorCliente(cliente.codigo).subscribe({
      next: pedidos => {
        this.lista.set([...pedidos].sort((a, b) => b.codigoPedido - a.codigoPedido));
        this.carregando.set(false);
        this.carregarNomes(pedidos);
      },
      error: e => { this.erro.set(mensagemErro(e)); this.carregando.set(false); }
    });
  }

  data = (p: Pedido) => paraData(p.dataPedido);
  aberto = (codigo: number) => this.abertos().includes(codigo);
  nome = (codigoProduto: number) => this.nomes()[codigoProduto] ?? `Produto #${codigoProduto}`;

  alternar(codigo: number): void {
    this.abertos.update(a => a.includes(codigo) ? a.filter(c => c !== codigo) : [...a, codigo]);
  }

  // Os itens do pedido guardam só o código do produto; busca os nomes para exibir.
  private carregarNomes(pedidos: Pedido[]): void {
    const ids = [...new Set(pedidos.flatMap(p => (p.itens ?? []).map(i => i.codigoProduto)))];
    if (!ids.length) return;
    forkJoin(ids.map(id => this.produtos.obter(id).pipe(catchError(() => of(null))))).subscribe(res => {
      const mapa: Record<number, string> = {};
      res.forEach((p, idx) => { if (p && p.codigo > 0) mapa[ids[idx]] = p.nome; });
      this.nomes.set(mapa);
    });
  }
}