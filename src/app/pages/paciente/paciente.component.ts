import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { MensagemPaciente, MensagemService } from '../../services/mensagem.service';
import { Pagamento, PagamentoService } from '../../services/pagamento.service';
import { PacienteRegistro, PacienteService } from '../../services/paciente.service';
import { Consulta, PortalApiService } from '../../services/portal-api.service';

@Component({
  selector: 'app-paciente-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './paciente.component.html',
  styleUrl: './paciente.component.css'
})
export class PacienteComponent implements OnInit {
  usuarioLogado?: Usuario;
  paciente?: PacienteRegistro;
  consultas: Consulta[] = [];
  pagamentos: Pagamento[] = [];
  mensagens: MensagemPaciente[] = [];
  mensagem = '';
  salvandoFoto = false;

  constructor(
    private authService: AuthService,
    private portalApi: PortalApiService,
    private pagamentoService: PagamentoService,
    private pacienteService: PacienteService,
    private mensagemService: MensagemService,
    private router: Router
  ) {}

  ngOnInit() {
    this.usuarioLogado = this.authService.usuarioAtual();
    if (!this.authService.temPerfil(['PACIENTE'])) {
      this.router.navigate(['/login-paciente']);
      return;
    }

    this.carregarConsultas();
    this.carregarPagamentos();
    this.carregarPaciente();
    this.carregarMensagens();
  }

  carregarPaciente() {
    const pacienteId = this.authService.pacienteAtualId();
    if (!pacienteId) {
      return;
    }

    this.pacienteService.buscarPorId(pacienteId).subscribe((paciente) => {
      this.paciente = paciente;
      if (paciente.fotoUrl) {
        this.usuarioLogado = this.authService.atualizarUsuarioLocal({ fotoUrl: paciente.fotoUrl }) || this.usuarioLogado;
      }
    });
  }

  carregarConsultas() {
    this.portalApi.listarConsultas().subscribe((consultas) => {
      const pacienteId = this.authService.pacienteAtualId();
      this.consultas = consultas.filter((consulta) => consulta.paciente === String(pacienteId));
    });
  }

  carregarPagamentos() {
    const pacienteId = this.authService.pacienteAtualId();
    if (!pacienteId) {
      return;
    }

    this.pagamentoService.listarPorPaciente(pacienteId).subscribe((pagamentos) => {
      this.pagamentos = pagamentos;
    });
  }

  carregarMensagens() {
    const pacienteId = this.authService.pacienteAtualId();
    if (!pacienteId) {
      return;
    }

    this.mensagemService.listarPorPaciente(pacienteId).subscribe((mensagens) => {
      this.mensagens = mensagens.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    });
  }

  get fotoPerfil(): string {
    return this.paciente?.fotoUrl || this.usuarioLogado?.fotoUrl || '';
  }

  get iniciaisPaciente(): string {
    const nome = this.usuarioLogado?.nome || this.paciente?.nome || 'Paciente';
    return nome.split(' ').slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();
  }

  get mensagensNaoLidas(): number {
    return this.mensagens.filter((mensagem) => mensagem.status === 'NAO_LIDA').length;
  }

  alterarFoto(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo || !this.paciente?.id) {
      return;
    }

    if (!arquivo.type.startsWith('image/')) {
      this.mensagem = 'Escolha um arquivo de imagem para usar como foto.';
      return;
    }

    const leitor = new FileReader();
    this.salvandoFoto = true;
    leitor.onload = () => {
      const fotoUrl = String(leitor.result);
      this.pacienteService.atualizar({ ...this.paciente!, fotoUrl }).subscribe({
        next: (paciente) => {
          this.paciente = paciente;
          this.usuarioLogado = this.authService.atualizarUsuarioLocal({ fotoUrl: paciente.fotoUrl, nome: paciente.nome }) || this.usuarioLogado;
          this.mensagem = 'Foto atualizada com sucesso.';
          this.salvandoFoto = false;
        },
        error: () => {
          this.mensagem = 'Não foi possível salvar a foto agora.';
          this.salvandoFoto = false;
        }
      });
    };
    leitor.readAsDataURL(arquivo);
  }

  marcarMensagemComoLida(mensagem: MensagemPaciente) {
    if (!mensagem.id || mensagem.status === 'LIDA') {
      return;
    }

    this.mensagemService.atualizar({ ...mensagem, status: 'LIDA' }).subscribe(() => {
      this.carregarMensagens();
    });
  }

  sair() {
    this.authService.sair();
    this.router.navigate(['/']);
  }

  get consultasAgendadas(): Consulta[] {
    return this.consultas.filter((consulta) => consulta.status === 'Agendada' || consulta.status === 'Pendente');
  }

  get consultasCanceladas(): Consulta[] {
    return this.consultas.filter((consulta) => consulta.status === 'Cancelada');
  }

  get pagamentosPendentes(): Consulta[] {
    return this.consultas.filter((consulta) => consulta.status === 'Pendente');
  }

  get pagamentosConfirmados(): Consulta[] {
    return this.consultas.filter((consulta) => consulta.status !== 'Pendente' && consulta.status !== 'Cancelada');
  }

  statusPagamento(consulta: Consulta): string {
    const pagamento = this.pagamentoDaConsulta(consulta);
    if (pagamento?.status === 'REEMBOLSADO') {
      return 'Reembolsado';
    }

    if (pagamento?.status === 'PENDENTE' || consulta.status === 'Pendente') {
      return 'Pagamento pendente';
    }

    return 'Pago';
  }

  formatarDia(data: string): string {
    if (!data) {
      return 'Data';
    }

    const [, mes, dia] = data.split('-');
    return `${dia}/${mes}`;
  }

  cancelarConsulta(consulta: Consulta) {
    if (!consulta.id) {
      return;
    }

    this.portalApi.atualizarConsulta({ ...consulta, status: 'Cancelada' }).subscribe({
      next: () => {
        this.mensagem = 'Consulta cancelada. O status do pagamento foi atualizado.';
        this.carregarConsultas();
      },
      error: () => this.mensagem = 'Não foi possível cancelar a consulta agora.'
    });
  }

  desistirConsulta(consulta: Consulta) {
    if (!consulta.id) {
      return;
    }

    const confirmar = window.confirm('Deseja desistir desta consulta? O pagamento será marcado para reembolso pelo mesmo método usado.');
    if (!confirmar) {
      return;
    }

    const pagamento = this.pagamentoDaConsulta(consulta);
    this.portalApi.atualizarConsulta({ ...consulta, status: 'Cancelada' }).subscribe({
      next: () => {
        if (!pagamento?.id) {
          this.mensagem = 'Consulta cancelada. Se houver pagamento vinculado, o reembolso será conferido pelo local de atendimento.';
          this.carregarConsultas();
          return;
        }

        this.pagamentoService.atualizar({ ...pagamento, status: pagamento.status === 'PAGO' ? 'REEMBOLSADO' : 'CANCELADO' }).subscribe({
          next: () => {
            this.mensagem = 'Consulta cancelada. O valor foi marcado como reembolsado para voltar pelo mesmo método de pagamento.';
            this.carregarConsultas();
            this.carregarPagamentos();
          },
          error: () => {
            this.mensagem = 'Consulta cancelada, mas não foi possível atualizar o reembolso agora.';
            this.carregarConsultas();
          }
        });
      },
      error: () => this.mensagem = 'Não foi possível cancelar a consulta agora.'
    });
  }

  private pagamentoDaConsulta(consulta: Consulta): Pagamento | undefined {
    return this.pagamentos.find((pagamento) => pagamento.agendamentoId === consulta.id);
  }

}
