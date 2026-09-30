import { Injectable, signal } from '@angular/core';

export interface Usuario { nome: string; email: string; senha: string; cpf: string; telefone: string; }
const USUARIOS = 'pgcar_usuarios';
const SESSAO = 'pgcar_sessao';

// Simulação em localStorage. No P2 será substituída por uma API.
@Injectable({ providedIn: 'root' })
export class AuthService {
  usuario = signal<Usuario | null>(this.ler<Usuario | null>(SESSAO, null));

  cadastrar(u: Usuario): boolean {
    const lista = this.ler<Usuario[]>(USUARIOS, []);
    if (lista.some(x => x.email.toLowerCase() === u.email.toLowerCase())) return false;
    localStorage.setItem(USUARIOS, JSON.stringify([...lista, u]));
    this.iniciarSessao(u);
    return true;
  }

  entrar(email: string, senha: string): boolean {
    const lista = this.ler<Usuario[]>(USUARIOS, []);
    const u = lista.find(x => x.email.toLowerCase() === email.toLowerCase() && x.senha === senha);
    if (u) this.iniciarSessao(u);
    return !!u;
  }

  sair(): void { localStorage.removeItem(SESSAO); this.usuario.set(null); }

  private iniciarSessao(u: Usuario): void {
    localStorage.setItem(SESSAO, JSON.stringify(u));
    this.usuario.set(u);
  }
  private ler<T>(chave: string, padrao: T): T {
    try { return JSON.parse(localStorage.getItem(chave) ?? 'null') ?? padrao; } catch { return padrao; }
  }
}
