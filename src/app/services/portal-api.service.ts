import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Especialidade {
  id?: number;
  nome: string;
}

export interface Medico {
  id?: number;
  nome: string;
  especialidade: string;
}

export interface Unidade {
  id?: number;
  nome: string;
}

export interface Consulta {
  id?: number;
  tipo: 'Presencial' | 'Teleconsulta';
  especialidadeOuMedico: string;
  local: string;
  paciente: string;
  pagamento: string;
  data: string;
  horario: string;
  status: string;
  tokenPagamento?: string;
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
  private readonly apiUrl = 'http://127.0.0.1:3000';

  constructor(private http: HttpClient) {}

  listarEspecialidades(): Observable<Especialidade[]> {
    return this.http.get<Especialidade[]>(`${this.apiUrl}/especialidades`);
  }

  listarMedicos(): Observable<Medico[]> {
    return this.http.get<Medico[]>(`${this.apiUrl}/medicos`);
  }

  listarUnidades(): Observable<Unidade[]> {
    return this.http.get<Unidade[]>(`${this.apiUrl}/unidades`);
  }

  listarConsultas(): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(`${this.apiUrl}/consultas`);
  }

  criarConsulta(consulta: Consulta): Observable<Consulta> {
    return this.http.post<Consulta>(`${this.apiUrl}/consultas`, consulta);
  }

  listarExames(): Observable<Exame[]> {
    return this.http.get<Exame[]>(`${this.apiUrl}/exames`);
  }
}
