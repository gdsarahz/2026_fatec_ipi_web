import { AbstractControl, ValidationErrors } from '@angular/forms';

export function cpfValido(c: AbstractControl): ValidationErrors | null {
  const v = String(c.value ?? '').replace(/\D/g, '');
  if (!v) return null;
  if (v.length !== 11 || /^(\d)\1+$/.test(v)) return { cpf: true };
  const dv = (n: number) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += +v[i] * (n + 1 - i);
    const r = (soma * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dv(9) === +v[9] && dv(10) === +v[10] ? null : { cpf: true };
}

// Regra de senha do projeto do professor: 8+ caracteres, maiúscula, minúscula, número e um símbolo de @$!%*?&
const SENHA_FORTE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function senhaForte(c: AbstractControl): ValidationErrors | null {
  const v = String(c.value ?? '');
  if (!v) return null;
  return SENHA_FORTE.test(v) ? null : { senhaFraca: true };
}

export function senhasIguais(g: AbstractControl): ValidationErrors | null {
  return g.get('senha')?.value === g.get('confirma')?.value ? null : { senhasDiferentes: true };
}

export function erroCampo(c: AbstractControl | null): string {
  if (!c || !c.touched || !c.errors) return '';
  const e = c.errors;
  if (e['required']) return 'Campo obrigatório.';
  if (e['email']) return 'Informe um e-mail válido.';
  if (e['minlength']) return `Use no mínimo ${e['minlength'].requiredLength} caracteres.`;
  if (e['cpf']) return 'CPF inválido.';
  if (e['senhaFraca']) return 'Use 8+ caracteres com maiúscula, minúscula, número e um símbolo (@$!%*?&).';
  if (e['maxlength']) return `Use no máximo ${e['maxlength'].requiredLength} caracteres.`;
  if (e['pattern']) return 'Formato inválido.';
  return 'Valor inválido.';
}
