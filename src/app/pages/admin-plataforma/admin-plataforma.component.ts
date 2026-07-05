import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Empresa, EmpresaService } from '../../services/empresa.service';

@Component({
  selector: 'app-admin-plataforma',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-plataforma.component.html',
  styleUrl: './admin-plataforma.component.css'
})
export class AdminPlataformaComponent implements OnInit {
  email = '';
  senha = '';
  mensagem = '';
  carregando = false;
  empresas: Empresa[] = [];

  constructor(public authService: AuthService, private empresaService: EmpresaService, private router: Router) {}

  ngOnInit() {
    if (this.authService.temPerfil(['ADMIN_PLATAFORMA'])) {
      this.carregarEmpresas();
    }
  }

  entrar() {
    this.carregando = true;
    this.mensagem = '';

    this.authService.login(this.email.trim(), this.senha.trim(), 'ADMIN_PLATAFORMA').subscribe({
      next: (usuario) => {
        if (!usuario) {
          this.mensagem = 'E-mail ou senha inválidos para administrador da plataforma.';
          this.carregando = false;
          return;
        }

        this.carregarEmpresas();
        this.router.navigate(['/dashboard-admin']);
        this.carregando = false;
      },
      error: () => {
        this.mensagem = 'Erro no login. Verifique se o backend está rodando.';
        this.carregando = false;
      }
    });
  }

  carregarEmpresas() {
    this.empresaService.listar().subscribe((empresas) => this.empresas = empresas);
  }

  alternarAprovacao(empresa: Empresa) {
    this.empresaService.atualizar({ ...empresa, aprovada: !empresa.aprovada }).subscribe(() => this.carregarEmpresas());
  }
}
