import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { erroCampo } from '../core/validadores';

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
            @if (falhou()) { <div class="alert alert-danger py-2">E-mail ou senha incorretos.</div> }
            <div class="d-flex justify-content-between align-items-center">
              <a href="#" class="link" (click)="$event.preventDefault(); abrirEsqueci()">Esqueci minha senha</a>
              <button class="btn-pg" type="submit">Entrar</button>
            </div>
          </form>
        </section>

        <section class="col-12 col-md-6 lado lado-direito">
          <h2>Ainda não tenho cadastro</h2>
          <p>Cadastre-se para finalizar seus pedidos e acompanhar suas compras.</p>
          <a routerLink="/cadastro" class="btn-pg d-inline-block">Clique aqui</a>
        </section>
      </div>
    </div>

    @if (modal()) {
      <div class="fundo" (click)="modal.set(false)">
        <div class="janela" role="dialog" aria-modal="true" aria-labelledby="tit-esqueci" (click)="$event.stopPropagation()">
          <button class="fechar" (click)="modal.set(false)" aria-label="Fechar"><i class="bi bi-x-lg"></i></button>
          <h2 id="tit-esqueci">Informe o seu e-mail</h2>
          @if (enviado()) {
            <div class="alert alert-success mb-0">Se o e-mail estiver cadastrado, você receberá as instruções para criar uma nova senha.</div>
          } @else {
            <form [formGroup]="formEsqueci" (ngSubmit)="enviar()" class="d-flex gap-2 align-items-start" novalidate>
              <div class="flex-grow-1">
                <input type="email" class="form-control" formControlName="email" aria-label="E-mail"
                       [class.is-invalid]="erroEsqueci()" placeholder="voce&#64;email.com">
                <div class="invalid-feedback">{{ erroEsqueci() }}</div>
              </div>
              <button class="btn-pg" type="submit">OK</button>
            </form>
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
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });
  formEsqueci = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]] });
  falhou = signal(false);
  modal = signal(false);
  enviado = signal(false);

  erro(c: 'email' | 'senha') { return erroCampo(this.form.controls[c]); }
  erroEsqueci() { return erroCampo(this.formEsqueci.controls.email); }

  entrar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { email, senha } = this.form.getRawValue();
    if (this.auth.entrar(email, senha)) this.router.navigate(['/']);
    else this.falhou.set(true);
  }

  abrirEsqueci(): void { this.enviado.set(false); this.formEsqueci.reset(); this.modal.set(true); }

  enviar(): void {
    this.formEsqueci.markAllAsTouched();
    if (this.formEsqueci.valid) this.enviado.set(true);
  }
}
