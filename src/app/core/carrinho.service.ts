import { Injectable, computed, signal } from '@angular/core';
import { Produto } from './produto.service';

export interface ItemCarrinho { produto: Produto; qtd: number; }
const CHAVE = 'pgcar_cesta';

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  itens = signal<ItemCarrinho[]>(this.carregar());
  aviso = signal('');
  quantidade = computed(() => this.itens().reduce((s, i) => s + i.qtd, 0));
  total = computed(() => this.itens().reduce((s, i) => s + i.qtd * i.produto.preco, 0));

  adicionar(produto: Produto): void {
    const lista = this.itens().map(i => ({ ...i }));
    const item = lista.find(i => i.produto.id === produto.id);
    if (item) item.qtd++; else lista.push({ produto, qtd: 1 });
    this.salvar(lista);
    this.mostrarAviso(`${produto.nome} adicionado à cesta.`);
  }

  alterar(id: number, delta: number): void {
    const lista = this.itens()
      .map(i => i.produto.id === id ? { ...i, qtd: i.qtd + delta } : i)
      .filter(i => i.qtd > 0);
    this.salvar(lista);
  }

  remover(id: number): void { this.salvar(this.itens().filter(i => i.produto.id !== id)); }
  limpar(): void { this.salvar([]); }

  private mostrarAviso(msg: string): void {
    this.aviso.set(msg);
    setTimeout(() => this.aviso.set(''), 2500);
  }
  private salvar(lista: ItemCarrinho[]): void {
    this.itens.set(lista);
    try { localStorage.setItem(CHAVE, JSON.stringify(lista)); } catch { /* ignora */ }
  }
  private carregar(): ItemCarrinho[] {
    try { return JSON.parse(localStorage.getItem(CHAVE) ?? '[]'); } catch { return []; }
  }
}
