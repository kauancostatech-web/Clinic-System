import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { PacienteService } from '../../services/paciente.service';
import { Especialidade, PortalApiService, Unidade } from '../../services/portal-api.service';
import { ValidacaoService } from '../../services/validacao.service';

@Component({
  selector: 'app-cadastro-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cadastro-paciente.component.html',
  styleUrl: './cadastro-paciente.component.css'
})
export class CadastroPacienteComponent implements OnInit {
  nome = '';
  email = '';
  senha = '';
  cpf = '';
  telefone = '';
  localPreferido = '';
  especialidadePreferida = '';
  mensagem = '';
  salvando = false;
  unidades: Unidade[] = [];
  especialidades: Especialidade[] = [];

  constructor(
    private authService: AuthService,
    private pacienteService: PacienteService,
    private portalApi: PortalApiService,
    private validacaoService: ValidacaoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.portalApi.listarUnidades().subscribe((unidades) => this.unidades = unidades);
    this.portalApi.listarEspecialidades().subscribe((especialidades) => this.especialidades = especialidades);
  }

  formatarCpf() {
    this.cpf = this.validacaoService.formatarCpf(this.cpf);
  }

  formatarTelefone() {
    this.telefone = this.validacaoService.formatarTelefone(this.telefone);
  }

  cadastrar() {
    if (!this.nome || !this.email || !this.senha || !this.cpf || !this.telefone) {
      this.mensagem = 'Preencha nome, e-mail, senha, CPF e telefone.';
      return;
    }

    if (!this.validacaoService.validarCpf(this.cpf)) {
      this.mensagem = 'Informe um CPF com 11 números para continuar.';
      return;
    }

    if (!this.validacaoService.validarTelefone(this.telefone) || !this.validacaoService.validarEmail(this.email)) {
      this.mensagem = 'Revise telefone e e-mail antes de continuar.';
      return;
    }

    this.salvando = true;
    this.mensagem = '';

    this.validacaoService.verificarCpfDuplicado(this.cpf).subscribe((duplicado) => {
      if (duplicado) {
        this.mensagem = 'Já existe uma conta cadastrada com esse CPF.';
        this.salvando = false;
        return;
      }

      this.pacienteService.criar({
        nome: this.nome.trim(),
        cpf: this.cpf,
        telefone: this.telefone,
        email: this.email.trim(),
        endereco: '',
        fotoUrl: '',
        ativo: true
      }).subscribe({
        next: (paciente) => {
          const usuario: Usuario = {
            nome: this.nome.trim(),
            email: this.email.trim(),
            senha: this.senha,
            perfil: 'PACIENTE',
            empresaId: null,
            pacienteId: paciente.id,
            ativo: true,
            cpf: this.cpf,
            telefone: this.telefone,
            localPreferido: this.localPreferido,
            especialidadePreferida: this.especialidadePreferida
          };

          this.authService.cadastrar(usuario).subscribe({
            next: () => {
              const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
              this.authService.login(usuario.email, usuario.senha, 'PACIENTE').subscribe({
                next: () => {
                  this.salvando = false;
                  this.router.navigateByUrl(returnUrl || '/dashboard-paciente');
                },
                error: () => {
                  this.mensagem = 'Cadastro realizado. Entre com seu e-mail e senha para continuar.';
                  this.salvando = false;
                  this.router.navigate(['/login-paciente'], { queryParams: returnUrl ? { returnUrl } : {} });
                }
              });
            },
            error: () => {
              this.mensagem = 'Paciente criado, mas não foi possível criar o usuário de acesso.';
              this.salvando = false;
            }
          });
        },
        error: () => {
          this.mensagem = 'Não foi possível realizar o cadastro.';
          this.salvando = false;
        }
      });
    });
  }
}
