import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { CarrinhoService } from '../core/carrinho.service';
import { AuthService } from '../core/auth.service';
import { PedidoService } from '../core/pedido.service';
import { ItemPedido, Pedido, Produto, arredondar, precoVenda } from '../core/models';
import { mensagemErro } from '../core/http-erro';

@Component({
  selector: 'app-cesta',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="container pagina">
      <h1>Carrinho</h1>

      @if (mensagem()) {
        <div class="alert alert-success">
          {{ mensagem() }}
          <a routerLink="/pedidos" class="fw-semibold ms-2">Ver meus pedidos</a>
        </div>
      }
      @if (erro()) { <div class="alert alert-danger">{{ erro() }}</div> }

      @if (carrinho.itens().length) {
        <div class="table-responsive">
          <table class="table tabela align-middle bg-white">
            <thead>
              <tr><th>Item</th><th class="text-center">Qtd</th><th class="text-end">Valor</th><th></th></tr>
            </thead>
            <tbody>
              @for (i of carrinho.itens(); track i.produto.codigo) {
                <tr>
                  <td class="col-nome"><a [routerLink]="['/produto', i.produto.codigo]" class="fw-semibold">{{ i.produto.nome }}</a></td>
                  <td class="text-center qtd">
                    <button class="btn btn-sm btn-outline-dark" (click)="carrinho.alterar(i.produto.codigo, -1)" aria-label="Diminuir">−</button>
                    <span>{{ i.qtd }}x</span>
                    <button class="btn btn-sm btn-outline-dark" (click)="carrinho.alterar(i.produto.codigo, 1)"
                            [disabled]="i.qtd >= i.produto.quantidade" aria-label="Aumentar">+</button>
                  </td>
                  <td class="text-end col-valor">{{ valorItem(i.produto, i.qtd) | currency:'BRL' }}</td>
                  <td class="text-end col-remover">
                    <button class="btn btn-sm text-danger" (click)="carrinho.remover(i.produto.codigo)" aria-label="Remover item">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr class="total"><td colspan="2">Total</td><td class="text-end">{{ carrinho.total() | currency:'BRL' }}</td><td></td></tr>
            </tfoot>
          </table>
        </div>

        @if (auth.usuario(); as u) {
          <div class="entrega mb-3">
            <p class="mb-1"><strong>Entrega em:</strong> {{ u.logradouro || 'endereço não informado' }}
              <a routerLink="/cadastro" class="ms-2">alterar</a></p>
            <label class="form-label" for="obs">Observações do pedido (opcional)</label>
            <textarea id="obs" class="form-control" rows="2" [formControl]="obs"
                      [class.is-invalid]="obs.invalid" placeholder="Ex.: ligar antes de entregar"></textarea>
            <div class="invalid-feedback">Use no máximo 255 caracteres.</div>
          </div>
        } @else {
          <div class="alert alert-info">
            Para finalizar o pedido você precisa
            <a routerLink="/login" [queryParams]="{ voltar: '/cesta' }" class="fw-semibold">entrar</a> ou
            <a routerLink="/cadastro" [queryParams]="{ voltar: '/cesta' }" class="fw-semibold">criar sua conta</a>.
          </div>
        }

        <div class="d-flex flex-wrap gap-2 justify-content-between">
          <button class="btn-contorno" (click)="carrinho.limpar()">Limpar carrinho</button>
          <button class="btn-pg" (click)="finalizar()" [disabled]="enviando()">
            {{ enviando() ? 'Enviando...' : 'Finalizar' }}
          </button>
        </div>
      } @else if (!mensagem()) {
        <div class="vazio">O carrinho está vazio. <a routerLink="/" class="fw-semibold text-danger">Ver peças</a></div>
      }
    </div>
  `,
  styles: [`
    .qtd { white-space: nowrap; }
    .qtd span { display: inline-block; min-width: 2.2rem; text-align: center; }
    .qtd .btn { min-width: 2.1rem; }
    @media (max-width: 575.98px) {
      .tabela thead { display: none; }
      .tabela, .tabela tbody, .tabela tfoot { display: block; }
      .tabela tbody tr { display: grid; grid-template-columns: 1fr auto; grid-template-areas: 'nome remover' 'qtd valor';
        gap: .5rem .75rem; align-items: center; padding: .75rem; border-bottom: 1px solid #dee2e6; }
      .tabela tbody td { display: block; padding: 0; border: 0; box-shadow: none; background: transparent; }
      .col-nome { grid-area: nome; }
      .col-remover { grid-area: remover; }
      .tabela td.qtd { grid-area: qtd; text-align: left !important; }
      .col-valor { grid-area: valor; font-weight: 600; }
      .tabela tfoot tr { display: flex; justify-content: space-between; align-items: baseline; padding: .75rem; }
      .tabela tfoot td { display: block; padding: 0; border: 0 !important; background: transparent; }
      .tabela tfoot td:empty { display: none; }
      .total td { font-size: 1.4rem; }
    }
    .total td { font-family: 'Barlow Condensed', sans-serif; font-size: 1.6rem; font-weight: 700; border-top: 2px solid var(--pg-grafite); }
    .entrega { background: #fff; border: 1px solid #d9dce1; padding: 1rem; }
  `]
})
export class CestaComponent {
  carrinho = inject(CarrinhoService);
  auth = inject(AuthService);
  private pedidos = inject(PedidoService);
  private router = inject(Router);

  obs = new FormControl('', { nonNullable: true, validators: [Validators.maxLength(255)] });
  enviando = signal(false);
  mensagem = signal('');
  erro = signal('');

  valorItem = (produto: Produto, qtd: number): number => arredondar(precoVenda(produto) * qtd);

  finalizar(): void {
    const cliente = this.auth.usuario();
    if (!cliente) {
      this.router.navigate(['/login'], { queryParams: { voltar: '/cesta' } });
      return;
    }
    if (!cliente.logradouro?.trim()) {
      this.erro.set('Informe seu endereço de entrega em "Meus dados" antes de finalizar.');
      return;
    }
    if (this.obs.invalid) return;

    const itens: ItemPedido[] = this.carrinho.itens().map(i => ({
      codigoItemPedido: 0,
      codigoProduto: i.produto.codigo,
      quantidade: i.qtd,
      valor: precoVenda(i.produto)
    }));
    const pedido: Pedido = {
      codigoPedido: 0,
      valorTotal: this.carrinho.total(),
      entrega: cliente.logradouro,
      obs: this.obs.value.trim(),
      codigoCliente: cliente.codigo,
      itens
    };

    this.enviando.set(true);
    this.erro.set('');
    this.pedidos.gravar(pedido).subscribe({
      next: msg => {
        this.carrinho.limpar();
        this.obs.reset();
        this.mensagem.set(msg);
        this.enviando.set(false);
      },
      error: e => {
        this.erro.set(mensagemErro(e, 'Não foi possível gravar o pedido. Tente novamente.'));
        this.enviando.set(false);
      }
    });
  }
}
