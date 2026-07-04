import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, PerfilUsuario } from './auth.service';

export const protegerRota = (perfis: PerfilUsuario[]): CanActivateFn => {
  return (_route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.estaLogado()) {
      const destino = perfis.includes('EMPRESA_ADMIN') ? '/login-empresa' : perfis.includes('ADMIN_PLATAFORMA') ? '/login-admin' : '/login-paciente';
      return router.createUrlTree([destino], { queryParams: { returnUrl: state.url } });
    }

    if (!authService.temPerfil(perfis)) {
      const usuario = authService.usuarioAtual();
      if (usuario?.perfil === 'PACIENTE') {
        return router.createUrlTree(['/dashboard-paciente']);
      }

      if (usuario?.perfil === 'EMPRESA_ADMIN') {
        return router.createUrlTree(['/empresa/dashboard']);
      }

      return router.createUrlTree(['/home']);
    }

    return true;
  };
};
