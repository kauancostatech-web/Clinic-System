import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Paciente } from './paciente.model';
import { PacientesService } from './pacientes.service';
import { AuthService, Usuario } from '../../services/auth.service';
import { Consulta, Especialidade, Exame, Medico, PortalApiService, Unidade } from '../../services/portal-api.service';
@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css']
})
export class PacientesComponent implements OnInit {
  telaAtual: 'pacientes' | 'consultas' | 'exames' | 'minha-saude' | 'login' | 'admin' = 'pacientes';

  nome: string = '';
  cpf: string = '';
  telefone: string = '';
  idEditando?: number;
  mensagem: string = '';

  pacientes: Paciente[] = [];
  carregando: boolean = false;
  salvando: boolean = false;
  excluindoId?: number;

  especialidades: Especialidade[] = [];
  medicos: Medico[] = [];
  unidades: Unidade[] = [];
  exames: Exame[] = [];
  consultas: Consulta[] = [];

  consultaTipo: 'Presencial' | 'Teleconsulta' = 'Presencial';
  consultaBusca = '';
  consultaLocal = '';
  consultaPaciente = '';
  consultaPagamento = 'Particular';
  consultaData = '';
  consultaHorario = '';
  agendando = false;

  usuarioNome = '';
  usuarioEmail = '';
  usuarioSenha = '';
  usuarioPerfil: 'admin' | 'paciente' = 'paciente';
  loginEmail = '';
  loginSenha = '';
  emailRecuperacao = '';
  emailPagamento = '';
  usuarioLogado?: Usuario;
  mensagemAuth = '';

  constructor(
    private pacientesService: PacientesService,
    private portalApi: PortalApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.listar();
    this.carregarPortal();
    this.usuarioLogado = this.authService.usuarioAtual();
  }

  mudarTela(tela: 'pacientes' | 'consultas' | 'exames' | 'minha-saude' | 'login' | 'admin') {
    this.telaAtual = tela;
    this.mensagem = '';
    this.mensagemAuth = '';

    if (tela === 'minha-saude' || tela === 'admin') {
      this.listarConsultas();
    }
  }

  carregarPortal() {
    this.portalApi.listarEspecialidades().subscribe((especialidades) => this.especialidades = especialidades);
    this.portalApi.listarMedicos().subscribe((medicos) => this.medicos = medicos);
    this.portalApi.listarUnidades().subscribe((unidades) => this.unidades = unidades);
    this.portalApi.listarExames().subscribe((exames) => this.exames = exames);
    this.listarConsultas();
  }

  listarConsultas() {
    this.portalApi.listarConsultas().subscribe((consultas) => this.consultas = consultas);
  }

  selecionarBuscaConsulta(valor: string) {
    this.consultaBusca = valor;
  }

  agendarConsulta() {
    if (!this.consultaBusca || !this.consultaLocal || !this.consultaPaciente || !this.consultaData || !this.consultaHorario) {
      this.mensagem = 'Preencha especialidade/medico, local, paciente, data e horario.';
      return;
    }

    const consulta: Consulta = {
      tipo: this.consultaTipo,
      especialidadeOuMedico: this.consultaBusca.trim(),
      local: this.consultaLocal,
      paciente: this.consultaPaciente.trim(),
      pagamento: this.consultaPagamento,
      data: this.consultaData,
      horario: this.consultaHorario,
      status: 'Agendada',
      tokenPagamento: this.consultaPagamento === 'Token de pagamento' ? this.gerarTokenLocal() : undefined
    };

    this.agendando = true;
    this.portalApi.criarConsulta(consulta).subscribe({
      next: (consultaCriada) => {
        this.consultas = [...this.consultas, consultaCriada];
        this.mensagem = consultaCriada.tokenPagamento
          ? `Consulta agendada. Token de pagamento: ${consultaCriada.tokenPagamento}.`
          : 'Consulta agendada com sucesso.';
        this.limparAgendamento();
        this.agendando = false;
      },
      error: () => {
        this.mensagem = 'Erro ao agendar consulta. Verifique se o JSON Server esta rodando.';
        this.agendando = false;
      }
    });
  }

  entrar() {
    this.authService.login(this.loginEmail.trim(), this.loginSenha.trim()).subscribe({
      next: (usuario) => {
        if (!usuario) {
          this.mensagemAuth = 'Email ou senha invalidos.';
          return;
        }

        this.usuarioLogado = usuario;
        this.mensagemAuth = `Login realizado como ${usuario.nome}.`;
      },
      error: () => this.mensagemAuth = 'Erro no login. Verifique o backend.'
    });
  }

  cadastrarUsuario() {
    if (!this.usuarioNome || !this.usuarioEmail || !this.usuarioSenha) {
      this.mensagemAuth = 'Preencha nome, email e senha para criar usuario.';
      return;
    }

    const usuario: Usuario = {
      nome: this.usuarioNome.trim(),
      email: this.usuarioEmail.trim(),
      senha: this.usuarioSenha,
      perfil: this.usuarioPerfil
    };

    this.authService.cadastrar(usuario).subscribe({
      next: () => {
        this.mensagemAuth = 'Usuario criado com sucesso.';
        this.usuarioNome = '';
        this.usuarioEmail = '';
        this.usuarioSenha = '';
        this.usuarioPerfil = 'paciente';
      },
      error: () => this.mensagemAuth = 'Erro ao criar usuario.'
    });
  }

  gerarTokenSenha() {
    if (!this.emailRecuperacao) {
      this.mensagemAuth = 'Informe o email para recuperar senha.';
      return;
    }

    this.authService.gerarTokenSenha(this.emailRecuperacao.trim()).subscribe({
      next: (registro) => this.mensagemAuth = `Token de recuperar senha: ${registro.token}.`,
      error: () => this.mensagemAuth = 'Erro ao gerar token de senha.'
    });
  }

  gerarTokenPagamento() {
    if (!this.emailPagamento) {
      this.mensagemAuth = 'Informe o email para gerar token de pagamento.';
      return;
    }

    this.authService.gerarTokenPagamento(this.emailPagamento.trim()).subscribe({
      next: (registro) => this.mensagemAuth = `Token de pagamento: ${registro.token}.`,
      error: () => this.mensagemAuth = 'Erro ao gerar token de pagamento.'
    });
  }

  sair() {
    this.authService.sair();
    this.usuarioLogado = undefined;
    this.mensagemAuth = 'Usuario desconectado.';
  }

  listar() {
    this.carregando = true;

    this.pacientesService.listar().subscribe({
      next: (pacientes) => {
        this.pacientes = pacientes;
        this.mensagem = '';
        this.carregando = false;
      },
      error: () => {
        this.mensagem = 'Erro ao carregar pacientes. Verifique se o JSON Server esta rodando na porta 3000.';
        this.carregando = false;
      }
    });
  }

  salvar() {
    const nome = this.nome.trim();
    const cpf = this.cpf.trim();
    const telefone = this.telefone.trim();

    if (!nome || !cpf || !telefone) {
      this.mensagem = 'Preencha todos os campos.';
      return;
    }

    const paciente: Paciente = {
      nome,
      cpf,
      telefone
    };

    this.salvando = true;
    this.mensagem = '';

    if (this.idEditando !== undefined) {
      paciente.id = this.idEditando;

      this.pacientesService.atualizar(paciente).subscribe({
        next: (pacienteAtualizado) => {
          this.pacientes = this.pacientes.map((pacienteLista) =>
            pacienteLista.id === pacienteAtualizado.id ? pacienteAtualizado : pacienteLista
          );
          this.mensagem = 'Paciente atualizado com sucesso.';
          this.limparFormulario();
          this.salvando = false;
        },
        error: (erro: HttpErrorResponse) => {
          this.mensagem = this.mensagemErro('atualizar', erro);
          this.salvando = false;
        }
      });
      return;
    }

    this.pacientesService.cadastrar(paciente).subscribe({
      next: (pacienteCadastrado) => {
        this.pacientes = [...this.pacientes, pacienteCadastrado];
        this.mensagem = 'Paciente cadastrado com sucesso.';
        this.limparFormulario();
        this.salvando = false;
      },
      error: (erro: HttpErrorResponse) => {
        this.mensagem = this.mensagemErro('cadastrar', erro);
        this.salvando = false;
      }
    });
  }

  editar(paciente: Paciente) {
    this.idEditando = paciente.id;
    this.nome = paciente.nome;
    this.cpf = paciente.cpf;
    this.telefone = paciente.telefone;
    this.mensagem = '';
  }

  excluir(paciente: Paciente) {
    if (!paciente.id) {
      return;
    }

    this.excluindoId = paciente.id;
    this.mensagem = '';

    this.pacientesService.excluir(paciente.id).subscribe({
      next: () => {
        this.pacientes = this.pacientes.filter((pacienteLista) => pacienteLista.id !== paciente.id);
        this.mensagem = 'Paciente excluido com sucesso.';
        this.excluindoId = undefined;
      },
      error: (erro: HttpErrorResponse) => {
        this.mensagem = this.mensagemErro('excluir', erro);
        this.excluindoId = undefined;
      }
    });
  }

  cancelarEdicao() {
    this.limparFormulario();
  }

  limparFormulario() {
    this.idEditando = undefined;
    this.nome = '';
    this.cpf = '';
    this.telefone = '';
    this.salvando = false;
  }

  private mensagemErro(acao: string, erro: HttpErrorResponse): string {
    if (erro.status === 0) {
      return `Erro ao ${acao} paciente. Verifique se o JSON Server esta rodando em http://127.0.0.1:3000.`;
    }

    return `Erro ao ${acao} paciente. Status: ${erro.status}.`;
  }

  private limparAgendamento() {
    this.consultaBusca = '';
    this.consultaLocal = '';
    this.consultaPaciente = '';
    this.consultaPagamento = 'Particular';
    this.consultaData = '';
    this.consultaHorario = '';
  }

  private gerarTokenLocal(): string {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }
}
