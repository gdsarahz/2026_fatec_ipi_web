import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api';
import { Produto } from './models';

// Os dados dos produtos vêm do backend (MySQL).
@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private http = inject(HttpClient);

  /** Produtos em destaque e com estoque (vitrine). */
  vitrine(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${API_URL}/produto/vitrine`);
  }

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${API_URL}/produto`);
  }

  buscar(termo: string): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${API_URL}/produto/busca/${this.segmento(termo)}`);
  }

  porCategoria(categoria: string): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${API_URL}/produto/categoria/${this.segmento(categoria)}`);
  }

  categorias(): Observable<string[]> {
    return this.http.get<string[]>(`${API_URL}/produto/categorias`);
  }

  /** Se o código não existir, o backend devolve um produto com codigo = 0. */
  obter(codigo: number): Observable<Produto> {
    return this.http.get<Produto>(`${API_URL}/produto/${codigo}`);
  }

  private segmento(texto: string): string {
    return encodeURIComponent(texto.trim().replace(/[\/\\]/g, ' '));
  }
}
