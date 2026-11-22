import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api';
import { Cliente } from './models';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);

  carregar(codigo: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${API_URL}/cliente/${codigo}`);
  }

  /** Novo cadastro. Devolve um cliente com codigo = 0 se o e-mail já existir. */
  gravar(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${API_URL}/cliente`, cliente);
  }

  alterar(cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${API_URL}/cliente`, cliente);
  }

  /** Cliente com codigo = 0 significa e-mail/senha inválidos. */
  login(email: string, senha: string): Observable<Cliente> {
    return this.http.post<Cliente>(`${API_URL}/cliente/login`, { email, senha });
  }

  resetarSenha(email: string): Observable<string> {
    return this.http.patch(`${API_URL}/cliente/resetarSenha`, { email }, { responseType: 'text' });
  }

  /**
   * Contrato do backend: "senha" = nova senha e "documento" = senha atual
   * (a temporária, no caso de quem pediu para reiniciar a senha).
   */
  alterarSenha(email: string, senhaAtual: string, novaSenha: string): Observable<string> {
    return this.http.patch(
      `${API_URL}/cliente/alterarSenha`,
      { email, senha: novaSenha, documento: senhaAtual },
      { responseType: 'text' }
    );
  }
}
