import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { cpfValido, erroCampo, senhasIguais } from '../core/validadores';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="container pagina">
      <h1>Cadastro</h1>
      <form [formGroup]="form" (ngSubmit)="salvar()" class="painel" novalidate>
        <div class="row g-3">
          <div class="col-12 col-md-8">
            <label class="form-label" for="nome">Nome</label>
            <input id="nome" class="form-control" formControlName="nome" [class.is-invalid]="erro('nome')" autocomplete="name">
            <div class="invalid-feedback">{{ erro('nome') }}</div>
          </div>
          <div class="col-12 col-md-8">
            <label class="form-label" for="email">E-mail</label>
            <input id="email" type="email" class="form-control" formControlName="email" [class.is-invalid]="erro('email')" autocomplete="email">
            <div class="invalid-feedback">{{ erro('email') }}</div>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="senha">Senha</label>
            <input id="senha" type="password" class="form-control" formControlName="senha" [class.is-invalid]="erro('senha')" autocomplete="new-password">
            <div class="invalid-feedback">{{ erro('senha') }}</div>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label" for="confirma">Confirmação de senha</label>
            <input id="confirma" type="password" class="form-control" formControlName="confirma"
                   [class.is-invalid]="erro('confirma') || diferentes()" autocomplete="new-password">
            <div class="invalid-feedback">{{ erro('confirma') || 'As senhas não conferem.' }}</div>
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label" for="cpf">CPF</label>
            <input id="cpf" class="form-control" formControlName="cpf" [class.is-invalid]="erro('cpf')" placeholder="000.000.000-00" inputmode="numeric">
            <div class="invalid-feedback">{{ erro('cpf') }}</div>
          </div>
          <div class="col-12 col-md-4">
            <label class="form-label" for="telefone">Telefone</label>
            <input id="telefone" class="form-control" formControlName="telefone" [class.is-invalid]="erro('telefone')" placeholder="(11) 99999-9999" inputmode="tel">
            <div class="invalid-feedback">{{ erro('telefone') }}</div>
          </div>
        </div>
        @if (duplicado()) { <div class="alert alert-danger mt-3 mb-0">Este e-mail já está cadastrado. <a routerLink="/login">Entrar</a></div> }
        <div class="mt-4 d-flex gap-2">
          <button class="btn-pg" type="submit">Cadastrar</button>
          <a routerLink="/login" class="btn-contorno">Voltar</a>
        </div>
      </form>
    </div>
  `,
  styles: [`.painel { background: #fff; border: 1px solid #d9dce1; padding: 1.5rem; max-width: 900px; }`]
})
export class CadastroComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  duplicado = signal(false);

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    confirma: ['', Validators.required],
    cpf: ['', [Validators.required, cpfValido]],
    telefone: ['', [Validators.required, Validators.pattern(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/)]]
  }, { validators: senhasIguais });

  erro(c: string) { return erroCampo(this.form.get(c)); }
  diferentes() { return this.form.hasError('senhasDiferentes') && this.form.controls.confirma.touched && !!this.form.controls.confirma.value; }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { confirma, ...dados } = this.form.getRawValue();
    if (this.auth.cadastrar(dados)) this.router.navigate(['/']);
    else this.duplicado.set(true);
  }
}
