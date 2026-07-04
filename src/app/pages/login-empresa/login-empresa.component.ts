import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-empresa.component.html',
  styleUrls: ['./login-empresa.component.css']
})
export class LoginEmpresaComponent {
  email = '';
  senha = '';
  mensagem = '';
  carregando = false;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  entrar() {
    this.carregando = true;
    this.mensagem = '';

    this.authService.login(this.email.trim(), this.senha.trim(), 'EMPRESA_ADMIN').subscribe({
      next: (usuario) => {
        if (!usuario) {
          this.mensagem = 'E-mail ou senha inválidos para empresa.';
          this.carregando = false;
          return;
        }

        this.router.navigateByUrl(this.route.snapshot.queryParamMap.get('returnUrl') || '/empresa/dashboard');
        this.carregando = false;
      },
      error: () => {
        this.mensagem = 'Erro no login. Verifique o backend.';
        this.carregando = false;
      }
    });
  }
}
