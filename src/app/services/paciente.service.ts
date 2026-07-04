import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PacienteRegistro {
  id?: number;
  nome: string;
  cpf: string;
  dataNascimento?: string;
  telefone: string;
  email: string;
  endereco?: string;
  fotoUrl?: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly apiUrl = 'http://localhost:3000/pacientes';

  constructor(private http: HttpClient) {}

  listar(): Observable<PacienteRegistro[]> {
    return this.http.get<PacienteRegistro[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<PacienteRegistro> {
    return this.http.get<PacienteRegistro>(`${this.apiUrl}/${id}`);
  }

  criar(paciente: PacienteRegistro): Observable<PacienteRegistro> {
    return this.http.post<PacienteRegistro>(this.apiUrl, paciente);
  }

  atualizar(paciente: PacienteRegistro): Observable<PacienteRegistro> {
    return this.http.put<PacienteRegistro>(`${this.apiUrl}/${paciente.id}`, paciente);
  }
}
