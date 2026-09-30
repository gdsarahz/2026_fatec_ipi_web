import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CarrinhoService } from '../core/carrinho.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-cesta',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="container pagina">
      <h1>Carrinho</h1>

      @if (concluido()) {
        <div class="alert alert-success">Pedido registrado com sucesso!</div>
      }

      @if (carrinho.itens().length) {
        <div class="table-responsive">
          <table class="table align-middle bg-white">
            <thead>
              <tr><th>Item</th><th class="text-center">Qtd</th><th class="text-end">Valor</th><th></th></tr>
            </thead>
            <tbody>
              @for (i of carrinho.itens(); track i.produto.id) {
                <tr>
                  <td><a [routerLink]="['/produto', i.produto.id]" class="fw-semibold">{{ i.produto.nome }}</a></td>
                  <td class="text-center qtd">
                    <button class="btn btn-sm btn-outline-dark" (click)="carrinho.alterar(i.produto.id, -1)" aria-label="Diminuir">−</button>
                    <span>{{ i.qtd }}x</span>
                    <button class="btn btn-sm btn-outline-dark" (click)="carrinho.alterar(i.produto.id, 1)" aria-label="Aumentar">+</button>
                  </td>
                  <td class="text-end">{{ i.produto.preco * i.qtd | currency:'BRL' }}</td>
                  <td class="text-end">
                    <button class="btn btn-sm text-danger" (click)="carrinho.remover(i.produto.id)" aria-label="Remover item">
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
        <div class="d-flex flex-wrap gap-2 justify-content-between">
          <button class="btn-contorno" (click)="carrinho.limpar()">Limpar carrinho</button>
          <button class="btn-pg" (click)="finalizar()">Finalizar</button>
        </div>
      } @else if (!concluido()) {
        <div class="vazio">O carrinho está vazio. <a routerLink="/" class="fw-semibold text-danger">Ver peças</a></div>
      }
    </div>
  `,
  styles: [`
    .qtd span { display: inline-block; min-width: 2.2rem; }
    .total td { font-family: 'Barlow Condensed', sans-serif; font-size: 1.6rem; font-weight: 700; border-top: 2px solid var(--pg-grafite); }
  `]
})
export class CestaComponent {
  carrinho = inject(CarrinhoService);
  private auth = inject(AuthService);
  private router = inject(Router);
  concluido = signal(false);

  finalizar(): void {
    if (!this.auth.usuario()) { this.router.navigate(['/login']); return; }
    this.carrinho.limpar();
    this.concluido.set(true);
  }
}
