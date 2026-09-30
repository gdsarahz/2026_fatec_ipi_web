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
  if (e['pattern']) return 'Formato inválido.';
  return 'Valor inválido.';
}
