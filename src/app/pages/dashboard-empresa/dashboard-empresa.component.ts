import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService, Usuario } from '../../services/auth.service';
import { Agenda, AgendaService } from '../../services/agenda.service';
import { Agendamento, AgendamentoService, StatusAgendamento } from '../../services/agendamento.service';
import { Empresa, EmpresaService } from '../../services/empresa.service';
import { PacienteRegistro, PacienteService } from '../../services/paciente.service';
import { Pagamento, PagamentoService, StatusPagamento } from '../../services/pagamento.service';
import { Profissional, ProfissionalService } from '../../services/profissional.service';
import { Servico, ServicoService } from '../../services/servico.service';

interface Indicador {
  rotulo: string;
  valor: string;
  detalhe: string;
}

type SecaoEmpresa = 'dashboard' | 'profissionais' | 'servicos' | 'agenda' | 'pacientes' | 'pagamentos' | 'configuracoes';

@Component({
  selector: 'app-dashboard-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard-empresa.component.html',
  styleUrl: './dashboard-empresa.component.css'
})
export class DashboardEmpresaComponent implements OnInit {
  usuarioLogado?: Usuario;
  empresa?: Empresa;
  secaoAtiva: SecaoEmpresa = 'dashboard';
  mensagem = '';

  consultas: Agendamento[] = [];
  pagamentos: Pagamento[] = [];
  profissionais: Profissional[] = [];
  servicosLista: Servico[] = [];
  pacientesLista: PacienteRegistro[] = [];
  agendas: Agenda[] = [];
  resumo: Indicador[] = [];

  profissionalForm: Profissional = this.novoProfissional();
  servicoForm: Servico = this.novoServico();
  agendaForm: Agenda = this.novaAgenda();
  empresaForm: Empresa = this.novaEmpresa();

  constructor(
    private authService: AuthService,
    private empresaService: EmpresaService,
    private agendamentoService: AgendamentoService,
    private pagamentoService: PagamentoService,
    private profissionalService: ProfissionalService,
    private servicoService: ServicoService,
    private pacienteService: PacienteService,
    private agendaService: AgendaService,
    private router: Router
  ) {}

  ngOnInit() {
    this.usuarioLogado = this.authService.usuarioAtual();
    if (!this.authService.temPerfil(['EMPRESA_ADMIN'])) {
      this.router.navigate(['/login-empresa']);
      return;
    }

    this.definirSecaoPelaUrl(this.router.url);
    this.router.events.pipe(filter((evento) => evento instanceof NavigationEnd)).subscribe((evento) => {
      this.definirSecaoPelaUrl((evento as NavigationEnd).urlAfterRedirects);
    });
    this.carregarDashboard();
  }

  get logoEmpresa(): string {
    return this.empresa?.logo || '';
  }

  get iniciaisEmpresa(): string {
    const nome = this.empresa?.nomeFantasia || 'Clinic System';
    return nome.split(' ').slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();
  }

  get pacientesDaEmpresa(): PacienteRegistro[] {
    const ids = new Set(this.consultas.map((consulta) => Number(consulta.pacienteId)));
    return this.pacientesLista.filter((paciente) => ids.has(Number(paciente.id)));
  }

  get agendasOrdenadas(): Agenda[] {
    return [...this.agendas].sort((a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`));
  }

  get pagamentosOrdenados(): Pagamento[] {
    return [...this.pagamentos].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  }

  carregarDashboard() {
    const empresaId = this.authService.empresaAtualId();
    if (!empresaId) {
      this.mensagem = 'Sua conta não está vinculada a uma empresa.';
      return;
    }

    this.empresaService.buscarPorId(empresaId).subscribe((empresa) => {
      this.empresa = empresa;
      this.empresaForm = { ...empresa };
    });

    this.agendamentoService.listarPorEmpresa(empresaId).subscribe((agendamentos) => {
      this.consultas = agendamentos.sort((a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`));
      this.recalcularDashboard();
    });

    this.pagamentoService.listarPorEmpresa(empresaId).subscribe((pagamentos) => {
      this.pagamentos = pagamentos;
      this.recalcularDashboard();
    });

    this.profissionalService.listar(empresaId).subscribe((profissionais) => {
      this.profissionais = profissionais;
      this.recalcularDashboard();
    });

    this.servicoService.listar(empresaId).subscribe((servicos) => {
      this.servicosLista = servicos;
      this.recalcularDashboard();
    });

    this.pacienteService.listar().subscribe((pacientes) => {
      this.pacientesLista = pacientes;
      this.recalcularDashboard();
    });

    this.agendaService.listar(empresaId).subscribe((agendas) => {
      this.agendas = agendas;
      this.recalcularDashboard();
    });
  }

  salvarProfissional() {
    const empresaId = this.authService.empresaAtualId();
    if (!empresaId) {
      return;
    }

    const profissional: Profissional = { ...this.profissionalForm, empresaId, ativo: true };
    const requisicao = profissional.id ? this.profissionalService.atualizar(profissional) : this.profissionalService.criar(profissional);
    requisicao.subscribe({
      next: () => {
        this.mensagem = profissional.id ? 'Profissional atualizado.' : 'Profissional cadastrado.';
        this.profissionalForm = this.novoProfissional();
        this.carregarDashboard();
      },
      error: () => this.mensagem = 'Não foi possível salvar o profissional.'
    });
  }

  editarProfissional(profissional: Profissional) {
    this.profissionalForm = { ...profissional };
    this.secaoAtiva = 'profissionais';
  }

  alternarProfissional(profissional: Profissional) {
    this.profissionalService.atualizar({ ...profissional, ativo: !profissional.ativo }).subscribe(() => this.carregarDashboard());
  }

  salvarServico() {
    const empresaId = this.authService.empresaAtualId();
    if (!empresaId || !this.servicoForm.profissionalId) {
      this.mensagem = 'Escolha um profissional para o serviço.';
      return;
    }

    const servico: Servico = { ...this.servicoForm, empresaId, ativo: true, valor: Number(this.servicoForm.valor), duracaoMinutos: Number(this.servicoForm.duracaoMinutos), formasPagamento: ['PIX', 'CARTAO'] };
    const requisicao = servico.id ? this.servicoService.atualizar(servico) : this.servicoService.criar(servico);
    requisicao.subscribe({
      next: () => {
        this.mensagem = servico.id ? 'Serviço atualizado.' : 'Serviço cadastrado.';
        this.servicoForm = this.novoServico();
        this.carregarDashboard();
      },
      error: () => this.mensagem = 'Não foi possível salvar o serviço.'
    });
  }

  editarServico(servico: Servico) {
    this.servicoForm = { ...servico };
    this.secaoAtiva = 'servicos';
  }

  alternarServico(servico: Servico) {
    this.servicoService.atualizar({ ...servico, ativo: !servico.ativo }).subscribe(() => this.carregarDashboard());
  }

  salvarAgenda() {
    const empresaId = this.authService.empresaAtualId();
    if (!empresaId || !this.agendaForm.profissionalId || !this.agendaForm.data || !this.agendaForm.horario) {
      this.mensagem = 'Preencha profissional, data e horário.';
      return;
    }

    const agenda: Agenda = { ...this.agendaForm, empresaId, disponivel: this.agendaForm.disponivel !== false };
    const requisicao = agenda.id ? this.agendaService.atualizar(agenda) : this.agendaService.criar(agenda);
    requisicao.subscribe({
      next: () => {
        this.mensagem = agenda.id ? 'Horário atualizado.' : 'Horário aberto na agenda.';
        this.agendaForm = this.novaAgenda();
        this.carregarDashboard();
      },
      error: () => this.mensagem = 'Não foi possível salvar o horário.'
    });
  }

  editarAgenda(agenda: Agenda) {
    this.agendaForm = { ...agenda };
    this.secaoAtiva = 'agenda';
  }

  alternarAgenda(agenda: Agenda) {
    this.agendaService.atualizar({ ...agenda, disponivel: !agenda.disponivel }).subscribe(() => this.carregarDashboard());
  }

  atualizarConsulta(consulta: Agendamento) {
    if (!consulta.id || consulta.status === 'CANCELADO' || consulta.status === 'REALIZADO') {
      return;
    }

    const status: StatusAgendamento = consulta.status === 'CONFIRMADO' ? 'REALIZADO' : 'CONFIRMADO';
    this.agendamentoService.atualizar({ ...consulta, status }).subscribe({
      next: () => {
        this.mensagem = status === 'REALIZADO' ? 'Consulta marcada como realizada.' : 'Consulta confirmada na agenda.';
        this.carregarDashboard();
      },
      error: () => this.mensagem = 'Não foi possível atualizar a consulta.'
    });
  }

  atualizarPagamento(pagamento: Pagamento, status: StatusPagamento) {
    this.pagamentoService.atualizar({ ...pagamento, status }).subscribe({
      next: () => {
        this.mensagem = 'Pagamento atualizado.';
        this.carregarDashboard();
      },
      error: () => this.mensagem = 'Não foi possível atualizar o pagamento.'
    });
  }

  salvarEmpresa() {
    if (!this.empresaForm.id) {
      return;
    }

    this.empresaService.atualizar(this.empresaForm).subscribe({
      next: (empresa) => {
        this.empresa = empresa;
        this.mensagem = 'Configurações da empresa atualizadas.';
      },
      error: () => this.mensagem = 'Não foi possível atualizar a empresa.'
    });
  }

  alterarLogo(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo || !arquivo.type.startsWith('image/')) {
      this.mensagem = 'Escolha uma imagem válida para a logo.';
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => {
      this.empresaForm.logo = String(leitor.result);
    };
    leitor.readAsDataURL(arquivo);
  }

  nomePaciente(pacienteId: number): string {
    return this.pacientesLista.find((paciente) => Number(paciente.id) === Number(pacienteId))?.nome || 'Conta não localizada';
  }

  nomeProfissional(profissionalId: number): string {
    return this.profissionais.find((profissional) => Number(profissional.id) === Number(profissionalId))?.nome || 'Profissional não localizado';
  }

  nomeServico(servicoId: number): string {
    return this.servicosLista.find((servico) => Number(servico.id) === Number(servicoId))?.nome || 'Serviço não localizado';
  }

  textoStatus(status: StatusAgendamento): string {
    const mapa: Record<StatusAgendamento, string> = {
      CONFIRMADO: 'Confirmada',
      PENDENTE: 'Pendente',
      CANCELADO: 'Cancelada',
      REALIZADO: 'Realizada'
    };
    return mapa[status];
  }

  classeStatus(status: string): string {
    return status.toLowerCase();
  }

  acaoConsulta(status: StatusAgendamento): string {
    if (status === 'CONFIRMADO') {
      return 'Marcar realizada';
    }
    if (status === 'PENDENTE') {
      return 'Confirmar consulta';
    }
    return 'Sem ação';
  }

  podeAtualizar(status: StatusAgendamento): boolean {
    return status === 'CONFIRMADO' || status === 'PENDENTE';
  }

  formatarMoeda(valor: number): string {
    return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  sair() {
    this.authService.sair();
    this.router.navigate(['/']);
  }

  private definirSecaoPelaUrl(url: string) {
    if (url.includes('/empresa/profissionais')) this.secaoAtiva = 'profissionais';
    else if (url.includes('/empresa/servicos') || url.includes('/empresa/valores')) this.secaoAtiva = 'servicos';
    else if (url.includes('/empresa/agenda')) this.secaoAtiva = 'agenda';
    else if (url.includes('/empresa/pacientes')) this.secaoAtiva = 'pacientes';
    else if (url.includes('/empresa/pagamentos')) this.secaoAtiva = 'pagamentos';
    else if (url.includes('/empresa/configuracoes') || url.includes('/empresa/perfil')) this.secaoAtiva = 'configuracoes';
    else this.secaoAtiva = 'dashboard';
  }

  private recalcularDashboard() {
    const pacientesAtivos = new Set(this.consultas.map((consulta) => consulta.pacienteId));
    const pagos = this.pagamentos.filter((pagamento) => pagamento.status === 'PAGO');
    const pendentes = this.pagamentos.filter((pagamento) => pagamento.status === 'PENDENTE');
    const recebido = pagos.reduce((total, pagamento) => total + pagamento.valor, 0);
    const pendenteReceber = pendentes.reduce((total, pagamento) => total + pagamento.valor, 0);
    const slotsDisponiveis = this.agendas.filter((agenda) => agenda.disponivel).length;

    this.resumo = [
      { rotulo: 'Profissionais', valor: String(this.profissionais.filter((item) => item.ativo).length), detalhe: `${this.profissionais.length} cadastrados` },
      { rotulo: 'Serviços', valor: String(this.servicosLista.filter((item) => item.ativo).length), detalhe: 'Especialidades com valor e duração' },
      { rotulo: 'Horários livres', valor: String(slotsDisponiveis), detalhe: `${this.agendas.length} horários no total` },
      { rotulo: 'Pacientes', valor: String(pacientesAtivos.size), detalhe: 'Com consulta vinculada à empresa' },
      { rotulo: 'Recebido', valor: this.formatarMoeda(recebido), detalhe: `${this.formatarMoeda(pendenteReceber)} pendente` },
      { rotulo: 'Consultas', valor: String(this.consultas.length), detalhe: 'Confirmadas, pendentes ou canceladas' }
    ];
  }

  private novoProfissional(): Profissional {
    return { empresaId: 0, nome: '', especialidade: '', registro: '', descricao: '', foto: '', ativo: true };
  }

  private novoServico(): Servico {
    return { empresaId: 0, profissionalId: 0, nome: '', descricao: '', valor: 0, duracaoMinutos: 30, formasPagamento: ['PIX', 'CARTAO'], ativo: true };
  }

  private novaAgenda(): Agenda {
    return { empresaId: 0, profissionalId: 0, data: '', horario: '', disponivel: true };
  }

  private novaEmpresa(): Empresa {
    return { nomeFantasia: '', razaoSocial: '', cnpj: '', telefone: '', email: '', endereco: '', descricao: '', logo: '', ativo: true, aprovada: false, criadoEm: '' };
  }
}
