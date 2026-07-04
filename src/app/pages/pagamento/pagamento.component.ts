import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Agenda, AgendaService } from '../../services/agenda.service';
import { Agendamento, AgendamentoService } from '../../services/agendamento.service';
import { AuthService } from '../../services/auth.service';
import { PagamentoService } from '../../services/pagamento.service';
import { Profissional, ProfissionalService } from '../../services/profissional.service';
import { Servico, ServicoService } from '../../services/servico.service';

@Component({
  selector: 'app-pagamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './pagamento.component.html',
  styleUrl: '../agendar-consulta/agendar-consulta.component.css'
})
export class PagamentoComponent implements OnInit {
  profissional?: Profissional;
  servico?: Servico;
  agenda?: Agenda;
  metodo: 'PIX' | 'CARTAO' = 'PIX';
  status: 'PAGO' | 'PENDENTE' = 'PAGO';
  mensagem = '';
  processando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private profissionalService: ProfissionalService,
    private servicoService: ServicoService,
    private agendaService: AgendaService,
    private agendamentoService: AgendamentoService,
    private pagamentoService: PagamentoService
  ) {}

  ngOnInit() {
    const profissionalId = Number(this.route.snapshot.paramMap.get('id'));
    const servicoId = Number(this.route.snapshot.queryParamMap.get('servicoId'));
    const agendaId = Number(this.route.snapshot.queryParamMap.get('agendaId'));

    this.profissionalService.buscarPorId(profissionalId).subscribe((profissional) => this.profissional = profissional);
    this.servicoService.buscarPorId(servicoId).subscribe((servico) => this.servico = servico);
    this.agendaService.buscarPorId(agendaId).subscribe((agenda) => this.agenda = agenda);
  }

  get valorFormatado(): string {
    return (this.servico?.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  selecionarMetodo(metodo: 'PIX' | 'CARTAO') {
    this.metodo = metodo;
    this.status = 'PAGO';
  }

  confirmarPagamento() {
    const pacienteId = this.authService.pacienteAtualId();
    if (!pacienteId || !this.profissional || !this.servico || !this.agenda?.id) {
      this.mensagem = 'Entre na sua conta e revise serviço e horário antes de confirmar.';
      return;
    }

    this.processando = true;
    const agendamento: Agendamento = {
      empresaId: this.profissional.empresaId,
      pacienteId,
      profissionalId: this.profissional.id!,
      servicoId: this.servico.id!,
      agendaId: this.agenda.id,
      data: this.agenda.data,
      horario: this.agenda.horario,
      status: this.status === 'PAGO' ? 'CONFIRMADO' : 'PENDENTE',
      valor: this.servico.valor
    };

    this.agendamentoService.criar(agendamento).subscribe({
      next: (agendamentoCriado) => {
        this.pagamentoService.criar({
          empresaId: agendamento.empresaId,
          pacienteId,
          agendamentoId: agendamentoCriado.id!,
          valor: agendamento.valor,
          metodo: this.metodo,
          status: this.status,
          criadoEm: new Date().toISOString().slice(0, 10)
        }).subscribe(() => {
          this.agendaService.atualizar({ ...this.agenda!, disponivel: false }).subscribe(() => {
            this.processando = false;
            this.router.navigate(['/confirmacao-consulta'], { queryParams: { agendamentoId: agendamentoCriado.id } });
          });
        });
      },
      error: () => {
        this.mensagem = 'Não foi possível confirmar o pagamento agora.';
        this.processando = false;
      }
    });
  }
}
