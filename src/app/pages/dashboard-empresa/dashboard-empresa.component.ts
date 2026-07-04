import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { Agenda, AgendaService } from '../../services/agenda.service';
import { Agendamento, AgendamentoService, StatusAgendamento } from '../../services/agendamento.service';
import { PacienteRegistro, PacienteService } from '../../services/paciente.service';
import { Pagamento, PagamentoService } from '../../services/pagamento.service';
import { Profissional, ProfissionalService } from '../../services/profissional.service';
import { Servico, ServicoService } from '../../services/servico.service';

interface Indicador {
  rotulo: string;
  valor: string;
  detalhe: string;
}

interface AtalhoOperacional {
  titulo: string;
  detalhe: string;
  rota: string;
}

interface ItemResumo {
  nome: string;
  valor: string;
}

@Component({
  selector: 'app-dashboard-empresa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard-empresa.component.html',
  styleUrl: './dashboard-empresa.component.css'
})
export class DashboardEmpresaComponent implements OnInit {
  usuarioLogado?: Usuario;
  consultas: Agendamento[] = [];
  pagamentos: Pagamento[] = [];
  profissionais: Profissional[] = [];
  servicosLista: Servico[] = [];
  pacientesLista: PacienteRegistro[] = [];
  agendas: Agenda[] = [];
  mensagem = '';

  resumo: Indicador[] = [];
  servicos: ItemResumo[] = [];
  pacientes: ItemResumo[] = [];
  financeiro: ItemResumo[] = [];
  relatorios: ItemResumo[] = [];

  atalhos: AtalhoOperacional[] = [
    {
      titulo: 'Cadastrar profissional',
      detalhe: 'Inclua médicos, terapeutas e outros profissionais da empresa.',
      rota: '/empresa/profissionais'
    },
    {
      titulo: 'Criar serviço',
      detalhe: 'Configure especialidades, duração e valor de consulta.',
      rota: '/empresa/servicos'
    },
    {
      titulo: 'Abrir agenda',
      detalhe: 'Veja horários disponíveis, marcados e cancelados.',
      rota: '/empresa/agenda'
    },
    {
      titulo: 'Ver pacientes',
      detalhe: 'Acompanhe pacientes com consultas ou pagamentos vinculados.',
      rota: '/empresa/pacientes'
    },
    {
      titulo: 'Conferir pagamentos',
      detalhe: 'Revise pagamentos pagos, pendentes, cancelados e reembolsados.',
      rota: '/empresa/pagamentos'
    },
    {
      titulo: 'Configurar empresa',
      detalhe: 'Atualize CNPJ, endereço, unidades e regras de cancelamento.',
      rota: '/empresa/configuracoes'
    }
  ];

  configuracoes: AtalhoOperacional[] = [
    { titulo: 'Dados do CNPJ', detalhe: 'Nome, documento e canais de contato.', rota: '/empresa/perfil' },
    { titulo: 'Unidades e endereços', detalhe: 'Locais de atendimento da empresa.', rota: '/empresa/configuracoes' },
    { titulo: 'Usuários e permissões', detalhe: 'Acessos administrativos do painel.', rota: '/empresa/configuracoes' },
    { titulo: 'Política de cancelamento', detalhe: 'Prazo de desistência e reembolso.', rota: '/empresa/configuracoes' }
  ];

  constructor(
    private authService: AuthService,
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

    this.carregarDashboard();
  }

  carregarDashboard() {
    const empresaId = this.authService.empresaAtualId();
    if (!empresaId) {
      this.mensagem = 'Sua conta não está vinculada a uma empresa.';
      return;
    }

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

  atualizarConsulta(consulta: Agendamento) {
    if (!consulta.id || consulta.status === 'CANCELADO' || consulta.status === 'REALIZADO') {
      return;
    }

    const status: StatusAgendamento = consulta.status === 'CONFIRMADO' ? 'REALIZADO' : 'CONFIRMADO';
    const atualizada: Agendamento = { ...consulta, status };
    this.agendamentoService.atualizar(atualizada).subscribe({
      next: () => {
        this.mensagem = status === 'REALIZADO' ? 'Consulta marcada como realizada.' : 'Consulta confirmada na agenda.';
        this.carregarDashboard();
      },
      error: () => this.mensagem = 'Não foi possível atualizar a consulta.'
    });
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

  classeStatus(status: StatusAgendamento): string {
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
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private recalcularDashboard() {
    const pacientesAtivos = new Set(this.consultas.map((consulta) => consulta.pacienteId));
    const confirmadas = this.totalPorStatus('CONFIRMADO');
    const pendentes = this.totalPorStatus('PENDENTE');
    const canceladas = this.totalPorStatus('CANCELADO');
    const realizadas = this.totalPorStatus('REALIZADO');
    const pagos = this.pagamentos.filter((pagamento) => pagamento.status === 'PAGO');
    const pagamentosPendentes = this.pagamentos.filter((pagamento) => pagamento.status === 'PENDENTE');
    const pagamentosCancelados = this.pagamentos.filter((pagamento) => pagamento.status === 'CANCELADO');
    const reembolsados = this.pagamentos.filter((pagamento) => pagamento.status === 'REEMBOLSADO');
    const recebido = pagos.reduce((total, pagamento) => total + pagamento.valor, 0);
    const pendenteReceber = pagamentosPendentes.reduce((total, pagamento) => total + pagamento.valor, 0);
    const slotsDisponiveis = this.agendas.filter((agenda) => agenda.disponivel).length;
    const profissionaisAtivos = this.profissionais.filter((profissional) => profissional.ativo).length;
    const servicosAtivos = this.servicosLista.filter((servico) => servico.ativo).length;
    const servicoMaisAgendado = this.servicoMaisAgendado();

    this.resumo = [
      { rotulo: 'Pacientes ativos', valor: String(pacientesAtivos.size), detalhe: `${this.pacientesLista.length} pacientes cadastrados no sistema` },
      { rotulo: 'Consultas na agenda', valor: String(this.consultas.length), detalhe: `${confirmadas} confirmadas, ${pendentes} pendentes` },
      { rotulo: 'Receita recebida', valor: this.formatarMoeda(recebido), detalhe: `${this.formatarMoeda(pendenteReceber)} pendente de pagamento` },
      { rotulo: 'Profissionais ativos', valor: String(profissionaisAtivos), detalhe: `${this.profissionais.length} profissionais cadastrados` },
      { rotulo: 'Serviços ativos', valor: String(servicosAtivos), detalhe: `${slotsDisponiveis} horários disponíveis` },
      { rotulo: 'Serviço mais buscado', valor: servicoMaisAgendado, detalhe: `${realizadas} consultas realizadas e ${canceladas} canceladas` }
    ];

    this.servicos = this.servicosLista
      .slice(0, 6)
      .map((servico) => ({
        nome: servico.nome,
        valor: `${this.formatarMoeda(servico.valor)} · ${servico.duracaoMinutos} min`
      }));

    this.pacientes = [
      { nome: 'Pacientes com consulta', valor: String(pacientesAtivos.size) },
      { nome: 'Consultas confirmadas', valor: String(confirmadas) },
      { nome: 'Consultas pendentes', valor: String(pendentes) },
      { nome: 'Cancelamentos registrados', valor: String(canceladas) }
    ];

    this.financeiro = [
      { nome: 'Pagamentos pagos', valor: String(pagos.length) },
      { nome: 'Pagamentos pendentes', valor: String(pagamentosPendentes.length) },
      { nome: 'Pagamentos cancelados', valor: String(pagamentosCancelados.length) },
      { nome: 'Reembolsos solicitados', valor: String(reembolsados.length) },
      { nome: 'Total recebido', valor: this.formatarMoeda(recebido) }
    ];

    this.relatorios = [
      { nome: 'Ocupação da agenda', valor: this.agendas.length ? `${Math.round(((this.agendas.length - slotsDisponiveis) / this.agendas.length) * 100)}%` : '0%' },
      { nome: 'Ticket médio pago', valor: pagos.length ? this.formatarMoeda(recebido / pagos.length) : this.formatarMoeda(0) },
      { nome: 'Serviço mais agendado', valor: servicoMaisAgendado },
      { nome: 'Pendências operacionais', valor: String(pendentes + pagamentosPendentes.length) }
    ];
  }

  private totalPorStatus(status: StatusAgendamento): number {
    return this.consultas.filter((consulta) => consulta.status === status).length;
  }

  private servicoMaisAgendado(): string {
    if (!this.consultas.length) {
      return 'Sem agendamentos';
    }

    const totais = this.consultas.reduce<Record<number, number>>((mapa, consulta) => {
      mapa[consulta.servicoId] = (mapa[consulta.servicoId] || 0) + 1;
      return mapa;
    }, {});

    const [servicoId] = Object.entries(totais).sort((a, b) => b[1] - a[1])[0];
    return this.nomeServico(Number(servicoId));
  }

  sair() {
    this.authService.sair();
    this.router.navigate(['/']);
  }
}
