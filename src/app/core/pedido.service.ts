import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api';
import { Pedido } from './models';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);

  /** Grava o pedido e seus itens. Responde com o texto "Pedido gravado com sucesso! <número>". */
  gravar(pedido: Pedido): Observable<string> {
    return this.http.post(`${API_URL}/pedido`, pedido, { responseType: 'text' });
  }

  pesquisar(codigo: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${API_URL}/pedido/${codigo}`);
  }

  listarPorCliente(codigoCliente: number): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${API_URL}/pedido/cliente/${codigoCliente}`);
  }
}
