import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Agenda, AgendaService } from '../../services/agenda.service';
import { AuthService } from '../../services/auth.service';
import { Profissional, ProfissionalService } from '../../services/profissional.service';
import { Servico, ServicoService } from '../../services/servico.service';

@Component({
  selector: 'app-agendar-consulta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './agendar-consulta.component.html',
  styleUrl: './agendar-consulta.component.css'
})
export class AgendarConsultaComponent implements OnInit {
  profissional?: Profissional;
  servicos: Servico[] = [];
  agendas: Agenda[] = [];
  servicoId?: number;
  agendaId?: number;
  mensagem = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private profissionalService: ProfissionalService,
    private servicoService: ServicoService,
    private agendaService: AgendaService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.profissionalService.buscarPorId(id).subscribe((profissional) => {
      this.profissional = profissional;
      this.servicoService.listar(profissional.empresaId).subscribe((servicos) => {
        this.servicos = servicos.filter((servico) => Number(servico.profissionalId) === Number(profissional.id) && servico.ativo);
        const servicoParam = Number(this.route.snapshot.queryParamMap.get('servicoId'));
        this.servicoId = this.servicos.find((servico) => Number(servico.id) === servicoParam)?.id || this.servicos[0]?.id;
      });
      this.agendaService.listar(profissional.empresaId).subscribe((agendas) => {
        this.agendas = agendas
          .filter((agenda) => Number(agenda.profissionalId) === Number(profissional.id))
          .sort((a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`));
        const agendaParam = Number(this.route.snapshot.queryParamMap.get('agendaId'));
        this.agendaId = this.agendas.find((agenda) => Number(agenda.id) === agendaParam && agenda.disponivel)?.id || this.proximaAgendaDisponivel?.id;
      });
    });
  }

  get servicoSelecionado(): Servico | undefined {
    return this.servicos.find((servico) => Number(servico.id) === Number(this.servicoId));
  }

  get agendaSelecionada(): Agenda | undefined {
    return this.agendas.find((agenda) => Number(agenda.id) === Number(this.agendaId));
  }

  get proximaAgendaDisponivel(): Agenda | undefined {
    return this.agendas.find((agenda) => agenda.disponivel);
  }

  selecionarAgenda(agenda: Agenda) {
    if (!agenda.disponivel) {
      this.mensagem = 'Esse horário já foi marcado por outra pessoa. Escolha um horário em verde.';
      return;
    }

    this.mensagem = '';
    this.agendaId = agenda.id;
  }

  horarioChegada(horario?: string): string {
    if (!horario) {
      return '--:--';
    }

    const [hora, minuto] = horario.split(':').map(Number);
    const data = new Date(2026, 0, 1, hora, minuto);
    data.setMinutes(data.getMinutes() - 15);
    return data.toTimeString().slice(0, 5);
  }

  continuar() {
    if (!this.profissional?.id || !this.servicoId || !this.agendaId) {
      this.mensagem = 'Escolha serviço e horário para continuar.';
      return;
    }

    if (!this.authService.temPerfil(['PACIENTE'])) {
      const returnUrl = this.router.createUrlTree(['/agendar-consulta', this.profissional.id], {
        queryParams: {
          servicoId: this.servicoId,
          agendaId: this.agendaId
        }
      }).toString();
      this.router.navigate(['/login-paciente'], { queryParams: { returnUrl } });
      return;
    }

    this.router.navigate(['/pagamento', this.profissional.id], {
      queryParams: {
        servicoId: this.servicoId,
        agendaId: this.agendaId
      }
    });
  }
}
