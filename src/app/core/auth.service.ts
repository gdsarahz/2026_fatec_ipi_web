import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClienteService } from './cliente.service';
import { Cliente } from './models';

const CHAVE = 'pgcar_cliente';

// Login e cadastro são feitos no backend. O navegador só guarda o cliente logado
// (sem a senha) para manter a sessão ao recarregar a página.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private clientes = inject(ClienteService);
  usuario = signal<Cliente | null>(this.lerSessao());

  constructor() {
    this.limparDadosAntigos();
    this.conferirSessao();
  }

  /** true se o login foi aceito pelo backend. */
  entrar(email: string, senha: string): Observable<boolean> {
    return this.clientes.login(email, senha).pipe(map(c => this.iniciar(c)));
  }

  /** true se o cadastro foi criado (false = dados inválidos ou e-mail já cadastrado). */
  cadastrar(cliente: Cliente): Observable<boolean> {
    return this.clientes.gravar(cliente).pipe(map(c => this.iniciar(c)));
  }

  /** true se os dados foram atualizados. */
  atualizar(cliente: Cliente): Observable<boolean> {
    return this.clientes.alterar(cliente).pipe(map(c => this.iniciar(c)));
  }

  sair(): void {
    try { localStorage.removeItem(CHAVE); } catch { /* ignora */ }
    this.usuario.set(null);
  }

  private iniciar(c: Cliente | null): boolean {
    if (!c || !c.codigo) return false;
    const { senha, ...semSenha } = c;
    this.usuario.set(semSenha);
    try { localStorage.setItem(CHAVE, JSON.stringify(semSenha)); } catch { /* ignora */ }
    return true;
  }

  // Se o cliente foi removido do banco, encerra a sessão guardada no navegador.
  private conferirSessao(): void {
    const atual = this.usuario();
    if (!atual) return;
    this.clientes.carregar(atual.codigo).subscribe({
      next: c => { if (!this.iniciar(c)) this.sair(); },
      error: () => { /* backend fora do ar: mantém a sessão */ }
    });
  }

  private lerSessao(): Cliente | null {
    try {
      const c = JSON.parse(localStorage.getItem(CHAVE) ?? 'null');
      return c && typeof c.codigo === 'number' && c.codigo > 0 ? c : null;
    } catch { return null; }
  }

  // Remove o que o P1 guardava no navegador (usuários e cesta locais).
  private limparDadosAntigos(): void {
    try {
      ['pgcar_usuarios', 'pgcar_sessao', 'pgcar_cesta'].forEach(k => localStorage.removeItem(k));
    } catch { /* ignora */ }
  }
}
