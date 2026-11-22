import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService } from '../core/cliente.service';
import { erroCampo, senhaForte, senhasIguais } from '../core/validadores';
import { mensagemErro } from '../core/http-erro';

@Component({
  selector: 'app-nova-senha',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="container pagina">
      <h1>Criar nova senha</h1>
      @if (concluido()) {
        <div class="alert alert-success">Senha alterada com sucesso! Agora você já pode entrar.</div>
        <a routerLink="/login" class="btn-pg d-inline-block">Ir para o login</a>
      } @else {
        <form [formGroup]="form" (ngSubmit)="salvar()" class="painel" novalidate>
          <p class="text-secondary">Informe o e-mail, a senha temporária recebida e escolha uma nova senha.</p>
          <div class="row g-3">
            <div class="col-12 col-md-8">
              <label class="form-label" for="email">E-mail</label>
              <input id="email" type="email" class="form-control" formControlName="email" [class.is-invalid]="erro('email')" autocomplete="email">
              <div class="invalid-feedback">{{ erro('email') }}</div>
            </div>
            <div class="col-12 col-md-8">
              <label class="form-label" for="atual">Senha temporária</label>
              <input id="atual" type="password" class="form-control" formControlName="atual" [class.is-invalid]="erro('atual')" autocomplete="current-password">
              <div class="invalid-feedback">{{ erro('atual') }}</div>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label" for="senha">Nova senha</label>
              <input id="senha" type="password" class="form-control" formControlName="senha" [class.is-invalid]="erro('senha')" autocomplete="new-password">
              <div class="invalid-feedback">{{ erro('senha') }}</div>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label" for="confirma">Confirmação da nova senha</label>
              <input id="confirma" type="password" class="form-control" formControlName="confirma"
                     [class.is-invalid]="erro('confirma') || diferentes()" autocomplete="new-password">
              <div class="invalid-feedback">{{ erro('confirma') || 'As senhas não conferem.' }}</div>
            </div>
          </div>
          @if (falha()) { <div class="alert alert-danger mt-3 mb-0">{{ falha() }}</div> }
          <div class="mt-4 d-flex gap-2">
            <button class="btn-pg" type="submit" [disabled]="enviando()">{{ enviando() ? 'Salvando...' : 'Salvar nova senha' }}</button>
            <a routerLink="/login" class="btn-contorno">Voltar</a>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`.painel { background: #fff; border: 1px solid #d9dce1; padding: 1.5rem; max-width: 900px; } @media (max-width: 575.98px) { .painel { padding: 1rem; } }`]
})
export class NovaSenhaComponent {
  private fb = inject(FormBuilder);
  private clientes = inject(ClienteService);

  form = this.fb.nonNullable.group({
    email: [inject(ActivatedRoute).snapshot.queryParamMap.get('email') ?? '', [Validators.required, Validators.email]],
    atual: ['', Validators.required],
    senha: ['', [Validators.required, senhaForte]],
    confirma: ['', Validators.required]
  }, { validators: senhasIguais });

  enviando = signal(false);
  concluido = signal(false);
  falha = signal('');

  erro(c: string) { return erroCampo(this.form.get(c)); }
  diferentes() {
    const confirma = this.form.get('confirma');
    return this.form.hasError('senhasDiferentes') && !!confirma?.touched && !!confirma.value;
  }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { email, atual, senha } = this.form.getRawValue();
    this.enviando.set(true);
    this.falha.set('');
    this.clientes.alterarSenha(email.trim(), atual, senha).subscribe({
      next: () => { this.enviando.set(false); this.concluido.set(true); },
      error: e => { this.enviando.set(false); this.falha.set(mensagemErro(e)); }
    });
  }
}
