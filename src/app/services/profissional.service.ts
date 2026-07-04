import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Profissional {
  id?: number;
  empresaId: number;
  nome: string;
  especialidade: string;
  registro: string;
  descricao: string;
  foto: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProfissionalService {
  private readonly apiUrl = 'http://localhost:3000/profissionais';

  constructor(private http: HttpClient) {}

  listar(empresaId?: number): Observable<Profissional[]> {
    const filtro = empresaId ? `?empresaId=${empresaId}` : '';
    return this.http.get<Profissional[]>(`${this.apiUrl}${filtro}`);
  }

  buscarPorId(id: number): Observable<Profissional> {
    return this.http.get<Profissional>(`${this.apiUrl}/${id}`);
  }

  criar(profissional: Profissional): Observable<Profissional> {
    return this.http.post<Profissional>(this.apiUrl, profissional);
  }

  atualizar(profissional: Profissional): Observable<Profissional> {
    return this.http.put<Profissional>(`${this.apiUrl}/${profissional.id}`, profissional);
  }
}
