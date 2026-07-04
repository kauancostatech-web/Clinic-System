import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type StatusAgendamento = 'CONFIRMADO' | 'PENDENTE' | 'CANCELADO' | 'REALIZADO';

export interface Agendamento {
  id?: number;
  empresaId: number;
  pacienteId: number;
  profissionalId: number;
  servicoId: number;
  agendaId: number;
  data: string;
  horario: string;
  status: StatusAgendamento;
  valor: number;
}

@Injectable({ providedIn: 'root' })
export class AgendamentoService {
  private readonly apiUrl = 'http://localhost:3000/agendamentos';

  constructor(private http: HttpClient) {}

  listarPorEmpresa(empresaId: number): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.apiUrl}?empresaId=${empresaId}`);
  }

  listarPorPaciente(pacienteId: number): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.apiUrl}?pacienteId=${pacienteId}`);
  }

  buscarPorId(id: number): Observable<Agendamento> {
    return this.http.get<Agendamento>(`${this.apiUrl}/${id}`);
  }

  criar(agendamento: Agendamento): Observable<Agendamento> {
    return this.http.post<Agendamento>(this.apiUrl, agendamento);
  }

  atualizar(agendamento: Agendamento): Observable<Agendamento> {
    return this.http.put<Agendamento>(`${this.apiUrl}/${agendamento.id}`, agendamento);
  }
}
