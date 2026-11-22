import { Injectable, computed, signal } from '@angular/core';
import { ItemCesta, Produto, arredondar, precoVenda } from './models';

const CHAVE = 'pgcar_cesta_v2';

// A cesta fica no navegador enquanto o cliente escolhe os produtos.
// Ao finalizar, o pedido é gravado no backend (PedidoService).
@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  itens = signal<ItemCesta[]>(this.carregar());
  aviso = signal('');
  quantidade = computed(() => this.itens().reduce((s, i) => s + i.qtd, 0));
  total = computed(() => arredondar(this.itens().reduce((s, i) => s + i.qtd * precoVenda(i.produto), 0)));

  adicionar(produto: Produto): boolean {
    const lista = this.itens().map(i => ({ ...i }));
    const item = lista.find(i => i.produto.codigo === produto.codigo);
    if (item) {
      if (item.qtd >= produto.quantidade) {
        this.mostrarAviso(`Estoque máximo de ${produto.nome} já está na cesta.`);
        return false;
      }
      item.qtd++;
      item.produto = produto;
    } else {
      if (produto.quantidade < 1) {
        this.mostrarAviso(`${produto.nome} está sem estoque.`);
        return false;
      }
      lista.push({ produto, qtd: 1 });
    }
    this.salvar(lista);
    this.mostrarAviso(`${produto.nome} adicionado à cesta.`);
    return true;
  }

  alterar(codigo: number, delta: number): void {
    const lista = this.itens()
      .map(i => {
        if (i.produto.codigo !== codigo) return i;
        const qtd = Math.min(i.qtd + delta, Math.max(i.produto.quantidade, 1));
        return { ...i, qtd };
      })
      .filter(i => i.qtd > 0);
    this.salvar(lista);
  }

  remover(codigo: number): void { this.salvar(this.itens().filter(i => i.produto.codigo !== codigo)); }
  limpar(): void { this.salvar([]); }

  private mostrarAviso(msg: string): void {
    this.aviso.set(msg);
    setTimeout(() => this.aviso.set(''), 2500);
  }

  private salvar(lista: ItemCesta[]): void {
    this.itens.set(lista);
    try { localStorage.setItem(CHAVE, JSON.stringify(lista)); } catch { /* ignora */ }
  }

  private carregar(): ItemCesta[] {
    try {
      const dados = JSON.parse(localStorage.getItem(CHAVE) ?? '[]');
      if (!Array.isArray(dados)) return [];
      return dados.filter(i => i && i.produto && typeof i.produto.codigo === 'number'
        && typeof i.produto.valor === 'number' && typeof i.qtd === 'number' && i.qtd > 0);
    } catch { return []; }
  }
}
