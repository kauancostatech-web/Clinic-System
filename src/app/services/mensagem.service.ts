import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type StatusMensagem = 'NAO_LIDA' | 'LIDA';

export interface MensagemPaciente {
  id?: number;
  pacienteId: number;
  profissionalId: number;
  profissionalNome: string;
  titulo: string;
  texto: string;
  criadoEm: string;
  status: StatusMensagem;
  consultaData?: string;
  consultaHorario?: string;
}

@Injectable({ providedIn: 'root' })
export class MensagemService {
  private readonly apiUrl = 'http://localhost:3000/mensagens';

  constructor(private http: HttpClient) {}

  listarPorPaciente(pacienteId: number): Observable<MensagemPaciente[]> {
    return this.http.get<MensagemPaciente[]>(`${this.apiUrl}?pacienteId=${pacienteId}`);
  }

  atualizar(mensagem: MensagemPaciente): Observable<MensagemPaciente> {
    return this.http.put<MensagemPaciente>(`${this.apiUrl}/${mensagem.id}`, mensagem);
  }
}
