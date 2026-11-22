import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { Cliente } from '../core/models';
import { cpfValido, erroCampo, senhaForte, senhasIguais } from '../core/validadores';
import { mensagemErro } from '../core/http-erro';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="container pagina">
      <h1>{{ editando ? 'Meus dados' : 'Cadastro' }}</h1>
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
          @if (!editando) {
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
          }
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
          <div class="col-12">
            <label class="form-label" for="logradouro">Endereço de entrega</label>
            <textarea id="logradouro" class="form-control" rows="3" formControlName="logradouro" [class.is-invalid]="erro('logradouro')"
                      placeholder="Rua, número, bairro, cidade, UF e CEP" autocomplete="street-address"></textarea>
            <div class="invalid-feedback">{{ erro('logradouro') }}</div>
          </div>
        </div>
        @if (sucesso()) { <div class="alert alert-success mt-3 mb-0">{{ sucesso() }}</div> }
        @if (falha()) { <div class="alert alert-danger mt-3 mb-0">{{ falha() }} @if (!editando && duplicado()) { <a routerLink="/login">Entrar</a> }</div> }
        <div class="mt-4 d-flex gap-2">
          <button class="btn-pg" type="submit" [disabled]="enviando()">
            {{ enviando() ? 'Salvando...' : (editando ? 'Salvar alterações' : 'Cadastrar') }}
          </button>
          @if (!editando) { <a routerLink="/login" class="btn-contorno">Voltar</a> }
        </div>
      </form>
    </div>
  `,
  styles: [`.painel { background: #fff; border: 1px solid #d9dce1; padding: 1.5rem; max-width: 900px; } @media (max-width: 575.98px) { .painel { padding: 1rem; } }`]
})
export class CadastroComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private voltar = this.caminhoInterno(inject(ActivatedRoute).snapshot.queryParamMap.get('voltar'));

  // com cliente logado a tela vira "Meus dados" (atualização); sem login, é o cadastro
  readonly editando = !!this.auth.usuario();
  enviando = signal(false);
  duplicado = signal(false);
  falha = signal('');
  sucesso = signal('');

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    senha: ['', [Validators.required, senhaForte]],
    confirma: ['', Validators.required],
    cpf: ['', [Validators.required, cpfValido]],
    telefone: ['', [Validators.required, Validators.pattern(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/)]],
    logradouro: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]]
  }, { validators: senhasIguais });

  constructor() {
    const atual = this.auth.usuario();
    if (atual) {
      // na edição a senha não é alterada aqui (use "Esqueci minha senha")
      this.form.controls.senha.disable();
      this.form.controls.confirma.disable();
      this.form.patchValue({
        nome: atual.nome, email: atual.email, cpf: atual.documento,
        telefone: atual.telefone, logradouro: atual.logradouro
      });
    }
  }

  erro(c: string) { return erroCampo(this.form.get(c)); }
  diferentes() {
    const confirma = this.form.get('confirma');
    return this.form.hasError('senhasDiferentes') && !!confirma?.touched && !!confirma.value;
  }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const cliente: Cliente = {
      codigo: this.auth.usuario()?.codigo ?? 0,
      nome: v.nome.trim(), email: v.email.trim(), telefone: v.telefone.trim(),
      documento: v.cpf.trim(), logradouro: v.logradouro.trim()
    };
    if (!this.editando) cliente.senha = v.senha;

    this.enviando.set(true);
    this.falha.set('');
    this.sucesso.set('');
    this.duplicado.set(false);

    const chamada$ = this.editando ? this.auth.atualizar(cliente) : this.auth.cadastrar(cliente);
    chamada$.subscribe({
      next: ok => {
        this.enviando.set(false);
        if (!ok) {
          this.duplicado.set(!this.editando);
          this.falha.set(this.editando
            ? 'Não foi possível salvar. Esse e-mail pode já estar em uso por outra conta.'
            : 'Não foi possível cadastrar. Este e-mail já está cadastrado.');
        } else if (this.editando) {
          this.sucesso.set('Dados atualizados com sucesso!');
        } else {
          this.router.navigateByUrl(this.voltar || '/');
        }
      },
      error: e => { this.enviando.set(false); this.falha.set(mensagemErro(e)); }
    });
  }

  private caminhoInterno(url: string | null): string {
    return url && url.startsWith('/') && !url.startsWith('//') ? url : '';
  }
}
