import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Agenda {
  id?: number;
  empresaId: number;
  profissionalId: number;
  data: string;
  horario: string;
  disponivel: boolean;
}

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly apiUrl = 'http://localhost:3000/agendas';

  constructor(private http: HttpClient) {}

  listar(empresaId?: number): Observable<Agenda[]> {
    const filtro = empresaId ? `?empresaId=${empresaId}` : '';
    return this.http.get<Agenda[]>(`${this.apiUrl}${filtro}`);
  }

  buscarPorId(id: number): Observable<Agenda> {
    return this.http.get<Agenda>(`${this.apiUrl}/${id}`);
  }

  criar(agenda: Agenda): Observable<Agenda> {
    return this.http.post<Agenda>(this.apiUrl, agenda);
  }

  atualizar(agenda: Agenda): Observable<Agenda> {
    return this.http.put<Agenda>(`${this.apiUrl}/${agenda.id}`, agenda);
  }
}
