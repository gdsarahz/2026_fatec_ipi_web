import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { ClienteService } from '../core/cliente.service';
import { erroCampo } from '../core/validadores';
import { mensagemErro } from '../core/http-erro';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="container pagina">
      <div class="row g-0 painel">
        <section class="col-12 col-md-6 lado">
          <h2>Já tenho cadastro</h2>
          <form [formGroup]="form" (ngSubmit)="entrar()" novalidate>
            <div class="mb-3">
              <label class="form-label" for="email">E-mail</label>
              <input id="email" type="email" class="form-control" formControlName="email"
                     [class.is-invalid]="erro('email')" placeholder="voce&#64;email.com" autocomplete="email">
              <div class="invalid-feedback">{{ erro('email') }}</div>
            </div>
            <div class="mb-3">
              <label class="form-label" for="senha">Senha</label>
              <input id="senha" type="password" class="form-control" formControlName="senha"
                     [class.is-invalid]="erro('senha')" autocomplete="current-password">
              <div class="invalid-feedback">{{ erro('senha') }}</div>
            </div>
            @if (falha()) {
              <div class="alert alert-danger py-2">
                {{ falha() }}
                @if (credenciais()) {
                  <br><small>Pediu para reiniciar a senha? <a routerLink="/nova-senha">Crie uma nova senha</a>.</small>
                }
              </div>
            }
            <div class="d-flex justify-content-between align-items-center">
              <a href="#" class="link" (click)="$event.preventDefault(); abrirEsqueci()">Esqueci minha senha</a>
              <button class="btn-pg" type="submit" [disabled]="enviando()">{{ enviando() ? 'Entrando...' : 'Entrar' }}</button>
            </div>
          </form>
        </section>

        <section class="col-12 col-md-6 lado lado-direito">
          <h2>Ainda não tenho cadastro</h2>
          <p>Cadastre-se para finalizar seus pedidos e acompanhar suas compras.</p>
          <a routerLink="/cadastro" [queryParams]="voltar ? { voltar: voltar } : {}" class="btn-pg d-inline-block">Clique aqui</a>
        </section>
      </div>
    </div>

    @if (modal()) {
      <div class="fundo" (click)="modal.set(false)">
        <div class="janela" role="dialog" aria-modal="true" aria-labelledby="tit-esqueci" (click)="$event.stopPropagation()">
          <button class="fechar" (click)="modal.set(false)" aria-label="Fechar"><i class="bi bi-x-lg"></i></button>
          <h2 id="tit-esqueci">Informe o seu e-mail</h2>
          @if (enviado()) {
            <div class="alert alert-success">
              Sua senha foi reiniciada. Use a senha temporária recebida por e-mail para criar uma nova senha.
              <br><small class="text-secondary">(Simulação: o envio de e-mail ainda não está ativo; a senha temporária é <b>Senha1234</b>.)</small>
            </div>
            <a routerLink="/nova-senha" [queryParams]="{ email: formEsqueci.controls.email.value }" class="btn-pg d-inline-block">Criar nova senha</a>
          } @else {
            <form [formGroup]="formEsqueci" (ngSubmit)="enviar()" class="d-flex gap-2 align-items-start" novalidate>
              <div class="flex-grow-1">
                <input type="email" class="form-control" formControlName="email" aria-label="E-mail"
                       [class.is-invalid]="erroEsqueci()" placeholder="voce&#64;email.com">
                <div class="invalid-feedback">{{ erroEsqueci() }}</div>
              </div>
              <button class="btn-pg" type="submit" [disabled]="enviando()">OK</button>
            </form>
            @if (falhaEsqueci()) { <div class="alert alert-danger py-2 mt-3 mb-0">{{ falhaEsqueci() }}</div> }
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .painel { background: #fff; border: 1px solid #d9dce1; max-width: 900px; margin: 0 auto; }
    .lado { padding: 2rem; }
    .lado h2 { font-size: 1.8rem; margin-bottom: 1.25rem; }
    .lado-direito { background: var(--pg-aco); display: flex; flex-direction: column; justify-content: center; align-items: flex-start; }
    .link { color: var(--pg-vermelho); text-decoration: underline; }
    .fundo { position: fixed; inset: 0; z-index: 3000; display: grid; place-items: center; padding: 1rem;
      background: repeating-linear-gradient(-45deg, rgba(29,33,39,.88) 0 14px, rgba(29,33,39,.8) 14px 28px); }
    .janela { position: relative; background: #fff; padding: 2rem 1.5rem 1.5rem; width: 100%; max-width: 440px; border-top: 6px solid var(--pg-vermelho); }
    .janela h2 { font-size: 1.7rem; margin-bottom: 1rem; }
    .fechar { position: absolute; top: .5rem; right: .5rem; border: 0; background: none; font-size: 1.1rem; }
    @media (min-width: 768px) { .lado:first-child { border-right: 1px solid #d9dce1; } }
    @media (max-width: 575.98px) {
      .lado { padding: 1.25rem; }
      .lado h2 { font-size: 1.5rem; }
      .janela { padding: 2rem 1rem 1rem; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private clientes = inject(ClienteService);
  private router = inject(Router);
  // página para onde voltar depois do login (ex.: /cesta); só aceita caminhos internos
  voltar = this.caminhoInterno(inject(ActivatedRoute).snapshot.queryParamMap.get('voltar'));

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required]
  });
  formEsqueci = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]] });
  falha = signal('');
  credenciais = signal(false);
  falhaEsqueci = signal('');
  enviando = signal(false);
  modal = signal(false);
  enviado = signal(false);

  erro(c: 'email' | 'senha') { return erroCampo(this.form.controls[c]); }
  erroEsqueci() { return erroCampo(this.formEsqueci.controls.email); }

  entrar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { email, senha } = this.form.getRawValue();
    this.enviando.set(true);
    this.falha.set('');
    this.auth.entrar(email, senha).subscribe({
      next: ok => {
        this.enviando.set(false);
        if (ok) {
          this.router.navigateByUrl(this.voltar || '/');
        } else {
          this.credenciais.set(true);
          this.falha.set('E-mail ou senha incorretos.');
        }
      },
      error: e => {
        this.enviando.set(false);
        this.credenciais.set(false);
        this.falha.set(mensagemErro(e));
      }
    });
  }

  abrirEsqueci(): void {
    this.enviado.set(false);
    this.falhaEsqueci.set('');
    this.formEsqueci.reset();
    this.modal.set(true);
  }

  enviar(): void {
    this.formEsqueci.markAllAsTouched();
    if (this.formEsqueci.invalid) return;
    this.enviando.set(true);
    this.falhaEsqueci.set('');
    this.clientes.resetarSenha(this.formEsqueci.controls.email.value).subscribe({
      next: () => { this.enviando.set(false); this.enviado.set(true); },
      error: e => { this.enviando.set(false); this.falhaEsqueci.set(mensagemErro(e)); }
    });
  }

  private caminhoInterno(url: string | null): string {
    return url && url.startsWith('/') && !url.startsWith('//') ? url : '';
  }
}
