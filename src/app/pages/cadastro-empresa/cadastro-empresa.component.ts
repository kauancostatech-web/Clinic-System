import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { Empresa, EmpresaService } from '../../services/empresa.service';
import { ValidacaoService } from '../../services/validacao.service';

@Component({
  selector: 'app-cadastro-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cadastro-empresa.component.html',
  styleUrl: './cadastro-empresa.component.css'
})
export class CadastroEmpresaComponent {
  nomeFantasia = '';
  razaoSocial = '';
  cnpj = '';
  telefone = '';
  email = '';
  cep = '';
  endereco = '';
  descricao = '';
  adminNome = '';
  adminEmail = '';
  senha = '';
  mensagem = '';
  consultando = false;
  salvando = false;

  constructor(
    private empresaService: EmpresaService,
    private authService: AuthService,
    private validacaoService: ValidacaoService,
    private router: Router
  ) {}

  formatarCnpj() {
    this.cnpj = this.validacaoService.formatarCnpj(this.cnpj);
  }

  formatarTelefone() {
    this.telefone = this.validacaoService.formatarTelefone(this.telefone);
  }

  formatarCep() {
    this.cep = this.validacaoService.formatarCep(this.cep);
  }

  consultarCep() {
    this.formatarCep();
    if (!this.validacaoService.validarCep(this.cep)) {
      this.mensagem = 'Informe um CEP com 8 números para buscar o endereço.';
      return;
    }

    this.consultando = true;
    this.validacaoService.consultarCep(this.cep).subscribe((dados) => {
      if (dados) {
        this.cep = dados.cep;
        this.endereco = dados.enderecoCompleto;
        this.mensagem = 'Endereço preenchido pelo CEP. Complete número e complemento se necessário.';
      } else {
        this.mensagem = 'Não foi possível encontrar esse CEP. Você pode preencher o endereço manualmente.';
      }
      this.consultando = false;
    });
  }

  consultarCnpj() {
    this.formatarCnpj();
    if (!this.validacaoService.validarCnpj(this.cnpj)) {
      this.mensagem = 'Informe um CNPJ com 14 números para consultar os dados públicos.';
      return;
    }

    this.consultando = true;
    this.validacaoService.consultarCnpj(this.cnpj).subscribe((dados) => {
      if (dados) {
        this.razaoSocial = dados.razaoSocial || this.razaoSocial;
        this.nomeFantasia = dados.nomeFantasia || this.nomeFantasia || this.razaoSocial;
        this.endereco = [dados.endereco, dados.cidade, dados.estado].filter(Boolean).join(' - ');
        this.telefone = dados.telefone || this.telefone;
        this.mensagem = dados.situacaoCadastral && dados.situacaoCadastral !== 'ATIVA'
          ? `CNPJ encontrado com situação ${dados.situacaoCadastral}. A aprovação ficará com o administrador da plataforma.`
          : 'Dados públicos do CNPJ preenchidos. Revise antes de cadastrar.';
      } else {
        this.mensagem = 'Não foi possível consultar o CNPJ agora. Você pode continuar o cadastro e aguardar aprovação.';
      }
      this.consultando = false;
    });
  }

  cadastrar() {
    if (!this.nomeFantasia || !this.razaoSocial || !this.cnpj || !this.email || !this.adminNome || !this.adminEmail || !this.senha) {
      this.mensagem = 'Preencha os dados da empresa e do administrador.';
      return;
    }

    if (!this.validacaoService.validarCnpj(this.cnpj) || !this.validacaoService.validarEmail(this.email) || !this.validacaoService.validarEmail(this.adminEmail)) {
      this.mensagem = 'Revise CNPJ e e-mails antes de continuar. O CNPJ precisa ter 14 números.';
      return;
    }

    this.salvando = true;
    this.validacaoService.verificarCnpjDuplicado(this.cnpj).subscribe((duplicado) => {
      if (duplicado) {
        this.mensagem = 'Já existe uma empresa cadastrada com esse CNPJ.';
        this.salvando = false;
        return;
      }

      const empresa: Empresa = {
        nomeFantasia: this.nomeFantasia.trim(),
        razaoSocial: this.razaoSocial.trim(),
        cnpj: this.cnpj,
        telefone: this.telefone,
        email: this.email.trim(),
        cep: this.cep,
        endereco: this.endereco.trim(),
        descricao: this.descricao.trim() || 'Empresa de saúde cadastrada na plataforma.',
        logo: '',
        ativo: true,
        aprovada: false,
        criadoEm: new Date().toISOString().slice(0, 10)
      };

      this.empresaService.criar(empresa).subscribe({
        next: (empresaCriada) => {
          const usuario: Usuario = {
            nome: this.adminNome.trim(),
            email: this.adminEmail.trim(),
            senha: this.senha,
            perfil: 'EMPRESA_ADMIN',
            empresaId: empresaCriada.id,
            pacienteId: null,
            ativo: true
          };
          this.authService.cadastrar(usuario).subscribe({
            next: () => {
              this.mensagem = 'Empresa cadastrada. Entre no portal para acompanhar a aprovação.';
              this.salvando = false;
              this.router.navigate(['/login-empresa']);
            },
            error: () => {
              this.mensagem = 'Empresa criada, mas não foi possível criar o usuário administrador.';
              this.salvando = false;
            }
          });
        },
        error: () => {
          this.mensagem = 'Não foi possível cadastrar a empresa agora.';
          this.salvando = false;
        }
      });
    });
  }
}
