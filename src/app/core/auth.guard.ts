import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Páginas que exigem cliente logado: se não houver, vai para o login e depois volta. */
export const exigeLogin: CanActivateFn = (_rota, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.usuario() ? true : router.createUrlTree(['/login'], { queryParams: { voltar: estado.url } });
};
