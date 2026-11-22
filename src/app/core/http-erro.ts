import { HttpErrorResponse } from '@angular/common/http';

/** Texto amigável para mostrar ao usuário quando uma chamada ao backend falha. */
export function mensagemErro(err: unknown, padrao = 'Ocorreu um erro, tente novamente mais tarde.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.';
    }
    // mensagem de texto enviada pelo backend em respostas 400 (ex.: "senha atual incorreta")
    if (err.status === 400 && typeof err.error === 'string') {
      const texto = err.error.trim();
      if (texto && !/^[{<\[]/.test(texto)) return texto;
    }
  }
  return padrao;
}
