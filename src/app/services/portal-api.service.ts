import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Servico } from './servico.service';
import { Profissional } from './profissional.service';
import { Empresa } from './empresa.service';
import { Agenda } from './agenda.service';
import { Agendamento } from './agendamento.service';

export interface Especialidade {
  id?: number;
  nome: string;
  descricao?: string;
  precoMedio?: string;
}

export interface Medico {
  id?: number;
  nome: string;
  especialidade: string;
  foto?: string;
  localAtendimento?: string;
  cidade?: string;
  bairro?: string;
  cep?: string;
  endereco?: string;
  valorConsulta?: string;
  valorNumero?: number;
  assinatura?: string;
  avaliacao?: string;
  resumo?: string;
  formasPagamento?: string[];
  proximaDisponibilidade?: string;
  horarioDisponivel?: string;
  servicos?: string[];
}

export interface Unidade {
  id?: number;
  nome: string;
  cidade?: string;
  bairro?: string;
  cep?: string;
  endereco?: string;
  valorConsulta?: string;
  assinatura?: string;
  especialidades?: string[];
}

export interface Consulta {
  id?: number;
  empresaId?: number;
  pacienteId?: number;
  profissionalId?: number;
  servicoId?: number;
  agendaId?: number;
  tipo: 'Presencial' | 'Teleconsulta';
  especialidadeOuMedico: string;
  local: string;
  paciente: string;
  pagamento: string;
  data: string;
  horario: string;
  status: 'Agendada' | 'Realizada' | 'Cancelada' | 'Pendente';
  tokenPagamento?: string;
  valor?: string;
}

export interface Exame {
  id?: number;
  nome: string;
  preparo: string;
}

@Injectable({
  providedIn: 'root'
})
export class PortalApiService {
  private readonly apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  listarEspecialidades(): Observable<Especialidade[]> {
    return this.http.get<Servico[]>(`${this.apiUrl}/servicos`).pipe(
      map((servicos) => {
        const nomes = Array.from(new Set(servicos.filter((servico) => servico.ativo).map((servico) => servico.nome)));
        return nomes.map((nome, index) => ({
          id: index + 1,
          nome,
          descricao: servicos.find((servico) => servico.nome === nome)?.descricao,
          precoMedio: `R$ ${Number(servicos.find((servico) => servico.nome === nome)?.valor || 0).toFixed(2).replace('.', ',')}`
        }));
      }),
      catchError(() => of([] as Especialidade[]))
    );
  }

  listarMedicos(): Observable<Medico[]> {
    return this.http.get<Profissional[]>(`${this.apiUrl}/profissionais`).pipe(
      switchMap((profissionais) => this.http.get<Empresa[]>(`${this.apiUrl}/empresas`).pipe(
        switchMap((empresas) => this.http.get<Servico[]>(`${this.apiUrl}/servicos`).pipe(
          switchMap((servicos) => this.http.get<Agenda[]>(`${this.apiUrl}/agendas`).pipe(
            map((agendas) => profissionais.filter((profissional) => profissional.ativo).map((profissional) => {
              const empresa = empresas.find((item) => this.mesmoId(item.id, profissional.empresaId));
              const servicosDoProfissional = servicos.filter((item) => this.mesmoId(item.profissionalId, profissional.id) && item.ativo);
              const menorValor = servicosDoProfissional.length ? Math.min(...servicosDoProfissional.map((item) => item.valor)) : undefined;
              const proximaAgenda = agendas
                .filter((agenda) => this.mesmoId(agenda.profissionalId, profissional.id) && agenda.disponivel)
                .sort((a, b) => `${a.data} ${a.horario}`.localeCompare(`${b.data} ${b.horario}`))[0];
              const pagamentos = Array.from(new Set(servicosDoProfissional.flatMap((servico) => servico.formasPagamento || ['PIX', 'CARTAO'])));

              return {
                id: Number(profissional.id),
                nome: profissional.nome,
                especialidade: profissional.especialidade,
                foto: profissional.foto,
                localAtendimento: empresa?.nomeFantasia,
                cidade: this.cidadeDaEmpresa(empresa?.endereco),
                bairro: empresa?.endereco?.split(',')[0] || empresa?.endereco,
                cep: empresa?.cep,
                endereco: empresa?.endereco,
                valorConsulta: menorValor ? `A partir de R$ ${menorValor.toFixed(2).replace('.', ',')}` : 'Valor a confirmar',
                valorNumero: menorValor,
                assinatura: 'Consulta avulsa com benefícios recorrentes quando disponíveis',
                avaliacao: '4.8',
                resumo: profissional.descricao,
                formasPagamento: pagamentos.map((item) => item === 'PIX' ? 'Pix' : 'Cartão de crédito'),
                proximaDisponibilidade: proximaAgenda ? proximaAgenda.data : 'Sem horário aberto',
                horarioDisponivel: proximaAgenda?.horario,
                servicos: servicosDoProfissional.map((servico) => servico.nome)
              } as Medico;
            }))
          ))
        ))
      )),
      catchError(() => of([] as Medico[]))
    );
  }

  listarUnidades(): Observable<Unidade[]> {
    return this.http.get<Empresa[]>(`${this.apiUrl}/empresas`).pipe(
      switchMap((empresas) => this.http.get<Profissional[]>(`${this.apiUrl}/profissionais`).pipe(
        switchMap((profissionais) => this.http.get<Servico[]>(`${this.apiUrl}/servicos`).pipe(
          map((servicos) => empresas.filter((empresa) => empresa.ativo).map((empresa) => {
            const servicosDaEmpresa = servicos.filter((servico) => this.mesmoId(servico.empresaId, empresa.id) && servico.ativo);
            const valores = servicosDaEmpresa.map((servico) => servico.valor);

            return {
              id: Number(empresa.id),
              nome: empresa.nomeFantasia,
              cidade: this.cidadeDaEmpresa(empresa.endereco),
              bairro: empresa.endereco?.split(',')[0] || empresa.endereco,
              cep: empresa.cep,
              endereco: empresa.endereco,
              valorConsulta: valores.length ? `A partir de R$ ${Math.min(...valores).toFixed(2).replace('.', ',')}` : 'Valor a confirmar',
              assinatura: 'Planos e pagamentos definidos pelo local de atendimento',
              especialidades: profissionais.filter((profissional) => this.mesmoId(profissional.empresaId, empresa.id)).map((profissional) => profissional.especialidade)
            };
          }))
        ))
      )),
      catchError(() => of([] as Unidade[]))
    );
  }

  listarConsultas(): Observable<Consulta[]> {
    return this.http.get<Agendamento[]>(`${this.apiUrl}/agendamentos`).pipe(
      switchMap((agendamentos) => this.http.get<Profissional[]>(`${this.apiUrl}/profissionais`).pipe(
        switchMap((profissionais) => this.http.get<Empresa[]>(`${this.apiUrl}/empresas`).pipe(
          map((empresas) => agendamentos.map((agendamento) => {
            const profissional = profissionais.find((item) => this.mesmoId(item.id, agendamento.profissionalId));
            const empresa = empresas.find((item) => this.mesmoId(item.id, agendamento.empresaId));
            return {
              id: agendamento.id,
              empresaId: agendamento.empresaId,
              pacienteId: agendamento.pacienteId,
              profissionalId: agendamento.profissionalId,
              servicoId: agendamento.servicoId,
              agendaId: agendamento.agendaId,
              tipo: 'Presencial',
              especialidadeOuMedico: profissional?.nome || 'Profissional',
              local: empresa?.nomeFantasia || 'Local de atendimento',
              paciente: String(agendamento.pacienteId),
              pagamento: agendamento.status === 'CONFIRMADO' ? 'Pagamento confirmado' : 'Pagamento pendente',
              data: agendamento.data,
              horario: agendamento.horario,
              status: agendamento.status === 'CONFIRMADO' ? 'Agendada' : agendamento.status === 'CANCELADO' ? 'Cancelada' : agendamento.status === 'REALIZADO' ? 'Realizada' : 'Pendente',
              valor: `R$ ${agendamento.valor.toFixed(2).replace('.', ',')}`
            } as Consulta;
          }))
        ))
      )),
      catchError(() => of([] as Consulta[]))
    );
  }

  criarConsulta(consulta: Consulta): Observable<Consulta> {
    return this.http.post<Consulta>(`${this.apiUrl}/agendamentos`, consulta);
  }

  atualizarConsulta(consulta: Consulta): Observable<Consulta> {
    const status = consulta.status === 'Agendada' ? 'CONFIRMADO' : consulta.status === 'Cancelada' ? 'CANCELADO' : consulta.status === 'Realizada' ? 'REALIZADO' : 'PENDENTE';
    return this.http.put<Consulta>(`${this.apiUrl}/agendamentos/${consulta.id}`, {
      id: consulta.id,
      empresaId: consulta.empresaId,
      pacienteId: consulta.pacienteId,
      profissionalId: consulta.profissionalId,
      servicoId: consulta.servicoId,
      agendaId: consulta.agendaId,
      data: consulta.data,
      horario: consulta.horario,
      status,
      valor: Number(String(consulta.valor || '0').replace(/\D/g, '')) / 100
    });
  }

  listarExames(): Observable<Exame[]> {
    return of([] as Exame[]);
  }

  private cidadeDaEmpresa(endereco?: string): string {
    if (!endereco) {
      return 'São Paulo, Brasil';
    }

    if (endereco.toLowerCase().includes('são paulo')) {
      return 'São Paulo, Brasil';
    }

    return `${endereco.split('-').pop()?.trim() || 'São Paulo'}, Brasil`;
  }

  private mesmoId(a?: number | string | null, b?: number | string | null): boolean {
    return Number(a) === Number(b);
  }
}
