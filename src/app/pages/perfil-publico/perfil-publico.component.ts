import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Medico, PortalApiService } from '../../services/portal-api.service';
import { AvaliacaoProfissional, AvaliacaoService } from '../../services/avaliacao.service';
import { Agenda, AgendaService } from '../../services/agenda.service';
import { Servico, ServicoService } from '../../services/servico.service';

interface DiaCalendario {
  data: string;
  dia: string;
  foraDoMes: boolean;
  agendas: Agenda[];
  disponivel: boolean;
  ocupado: boolean;
}

@Component({
  selector: 'app-perfil-publico',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil-publico.component.html',
  styleUrl: './perfil-publico.component.css'
})
export class PerfilPublicoComponent implements OnInit {
  medico?: Medico;
  avaliacoes: AvaliacaoProfissional[] = [];
  horarios: Agenda[] = [];
  servicos: Servico[] = [];
  agendaSelecionadaId?: number;
  dataSelecionada = '';
  avisoAgenda = '';
  mesReferencia = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  readonly diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  constructor(
    private route: ActivatedRoute,
    private portalApi: PortalApiService,
    private avaliacaoService: AvaliacaoService,
    private agendaService: AgendaService,
    private servicoService: ServicoService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.portalApi.listarMedicos().subscribe((medicos) => {
      this.medico = medicos.find((item) => Number(item.id) === id);
      if (this.medico?.id) {
        this.carregarAvaliacoes(this.medico.id);
        this.carregarAgenda(this.medico.id);
      }
    });
  }

  get mediaAvaliacoes(): string {
    if (!this.avaliacoes.length) {
      return this.medico?.avaliacao || 'Sem nota';
    }

    const media = this.avaliacoes.reduce((total, avaliacao) => total + avaliacao.nota, 0) / this.avaliacoes.length;
    return media.toFixed(1);
  }

  get totalAvaliacoes(): string {
    if (!this.avaliacoes.length) {
      return 'Nenhuma avaliação publicada ainda';
    }

    return `${this.avaliacoes.length} avaliação${this.avaliacoes.length > 1 ? 'es' : ''}`;
  }

  get agendaSelecionada(): Agenda | undefined {
    return this.horarios.find((agenda) => Number(agenda.id) === Number(this.agendaSelecionadaId));
  }

  get diasCalendario(): DiaCalendario[] {
    const ano = this.mesReferencia.getFullYear();
    const mes = this.mesReferencia.getMonth() + 1;
    const primeiroDia = new Date(ano, mes - 1, 1);
    const inicio = new Date(primeiroDia);
    inicio.setDate(primeiroDia.getDate() - primeiroDia.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const data = new Date(inicio);
      data.setDate(inicio.getDate() + index);
      const dataTexto = this.dataParaTexto(data);
      const agendas = this.horarios.filter((agenda) => agenda.data === dataTexto);
      return {
        data: dataTexto,
        dia: String(data.getDate()).padStart(2, '0'),
        foraDoMes: data.getMonth() !== mes - 1,
        agendas,
        disponivel: agendas.some((agenda) => agenda.disponivel),
        ocupado: agendas.length > 0 && agendas.every((agenda) => !agenda.disponivel)
      };
    });
  }

  get horariosDoDiaSelecionado(): Agenda[] {
    if (!this.dataSelecionada) {
      return [];
    }

    return this.horarios.filter((agenda) => agenda.data === this.dataSelecionada);
  }

  get mesCalendario(): string {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(this.mesReferencia);
  }

  selecionarAgenda(agenda: Agenda) {
    if (!agenda.disponivel) {
      this.avisoAgenda = 'Esse horário já foi marcado. Escolha um horário disponível.';
      return;
    }

    this.avisoAgenda = '';
    this.dataSelecionada = agenda.data;
    this.agendaSelecionadaId = agenda.id;
  }

  estrelas(nota: number): string {
    return '★'.repeat(Math.round(nota)) + '☆'.repeat(5 - Math.round(nota));
  }

  selecionarDia(dia: DiaCalendario) {
    this.dataSelecionada = dia.data;

    if (!dia.agendas.length) {
      this.agendaSelecionadaId = undefined;
      this.avisoAgenda = 'Esse dia ainda não tem horários abertos.';
      return;
    }

    const horarioDisponivel = dia.agendas.find((agenda) => agenda.disponivel);
    if (!horarioDisponivel) {
      this.agendaSelecionadaId = undefined;
      this.avisoAgenda = 'Todos os horários desse dia já foram marcados.';
      return;
    }

    this.selecionarAgenda(horarioDisponivel);
  }

  mesAnterior() {
    this.alterarMes(-1);
  }

  proximoMes() {
    this.alterarMes(1);
  }

  private carregarAvaliacoes(profissionalId: number) {
    this.avaliacaoService.listarPorProfissional(profissionalId).subscribe((avaliacoes) => {
      this.avaliacoes = avaliacoes;
    });
  }

  private carregarAgenda(profissionalId: number) {
    this.servicoService.listar().subscribe((servicos) => {
      this.servicos = servicos.filter((servico) => Number(servico.profissionalId) === profissionalId && servico.ativo);
    });

    this.agendaService.listar().subscribe((agendas) => {
      this.horarios = agendas
        .filter((agenda) => Number(agenda.profissionalId) === profissionalId)
        .sort((a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`));
      const primeiraDisponivel = this.horarios.find((agenda) => agenda.disponivel);
      this.dataSelecionada = primeiraDisponivel?.data || this.horarios[0]?.data || '';
      this.agendaSelecionadaId = primeiraDisponivel?.id;
      const referencia = primeiraDisponivel?.data || this.horarios[0]?.data;
      if (referencia) {
        this.mesReferencia = this.dataTextoParaMes(referencia);
      }
    });
  }

  private alterarMes(delta: number) {
    this.mesReferencia = new Date(this.mesReferencia.getFullYear(), this.mesReferencia.getMonth() + delta, 1);
    const [ano, mes] = this.dataSelecionada.split('-').map(Number);
    const selecaoContinuaVisivel = ano === this.mesReferencia.getFullYear() && mes === this.mesReferencia.getMonth() + 1;
    if (!selecaoContinuaVisivel) {
      this.dataSelecionada = '';
      this.agendaSelecionadaId = undefined;
      this.avisoAgenda = 'Nenhum dia selecionado neste mês.';
    }
  }

  private dataTextoParaMes(dataTexto: string): Date {
    const [ano, mes] = dataTexto.split('-').map(Number);
    return new Date(ano, mes - 1, 1);
  }

  private dataParaTexto(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}
