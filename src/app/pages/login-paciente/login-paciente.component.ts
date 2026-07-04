import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-paciente.component.html',
  styleUrl: './login-paciente.component.css'
})
export class LoginPacienteComponent {
  email = '';
  senha = '';
  emailRecuperacao = '';
  codigoRecuperacao = '';
  novaSenha = '';
  mensagem = '';
  mensagemRecuperacao = '';
  carregando = false;
  recuperandoSenha = false;
  modoRecuperacao = false;

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  entrar() {
    this.carregando = true;
    this.mensagem = '';

    this.authService.login(this.email.trim(), this.senha.trim(), 'PACIENTE').subscribe({
      next: (usuario) => {
        if (!usuario) {
          this.mensagem = 'E-mail ou senha inválidos.';
          this.carregando = false;
          return;
        }

        this.router.navigateByUrl(this.returnUrl());
        this.carregando = false;
      },
      error: () => {
        this.mensagem = 'Erro no login. Verifique o backend.';
        this.carregando = false;
      }
    });
  }

  entrarComSocial(provedor: 'Google' | 'Facebook') {
    this.carregando = true;
    this.mensagem = '';

    this.authService.login('maria@email.com', '123456', 'PACIENTE').subscribe({
      next: (usuario) => {
        if (!usuario) {
          this.mensagem = `Não foi possível simular entrada com ${provedor}.`;
          this.carregando = false;
          return;
        }

        this.router.navigateByUrl(this.returnUrl());
        this.carregando = false;
      },
      error: () => {
        this.mensagem = `Erro ao simular entrada com ${provedor}.`;
        this.carregando = false;
      }
    });
  }

  abrirRecuperacao() {
    this.modoRecuperacao = !this.modoRecuperacao;
    this.emailRecuperacao = this.email;
    this.mensagemRecuperacao = '';
  }

  solicitarRecuperacao() {
    if (!this.emailRecuperacao) {
      this.mensagemRecuperacao = 'Informe o e-mail vinculado à sua conta.';
      return;
    }

    this.recuperandoSenha = true;
    this.authService.solicitarRecuperacaoSenha(this.emailRecuperacao.trim()).subscribe({
      next: (token) => {
        this.mensagemRecuperacao = `Código de recuperação gerado: ${token.token}. Em produção esse código deve ser enviado por e-mail real via SMTP, SendGrid, Resend ou EmailJS.`;
        this.recuperandoSenha = false;
      },
      error: () => {
        this.mensagemRecuperacao = 'Não encontramos uma conta com esse e-mail.';
        this.recuperandoSenha = false;
      }
    });
  }

  redefinirSenha() {
    if (!this.emailRecuperacao || !this.codigoRecuperacao || !this.novaSenha) {
      this.mensagemRecuperacao = 'Preencha e-mail, código recebido e nova senha.';
      return;
    }

    this.recuperandoSenha = true;
    this.authService.redefinirSenhaComToken(this.emailRecuperacao.trim(), this.codigoRecuperacao.trim(), this.novaSenha).subscribe({
      next: () => {
        this.mensagemRecuperacao = 'Senha alterada com sucesso. Você já pode entrar com a nova senha.';
        this.recuperandoSenha = false;
      },
      error: () => {
        this.mensagemRecuperacao = 'Código inválido ou expirado. Gere um novo código de recuperação.';
        this.recuperandoSenha = false;
      }
    });
  }

  get cadastroQueryParams(): { returnUrl?: string } {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    return returnUrl ? { returnUrl } : {};
  }

  private returnUrl(): string {
    return this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard-paciente';
  }
}
