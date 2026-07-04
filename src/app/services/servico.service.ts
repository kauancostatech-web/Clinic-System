import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Servico {
  id?: number;
  empresaId: number;
  profissionalId: number;
  nome: string;
  descricao: string;
  valor: number;
  duracaoMinutos: number;
  formasPagamento?: Array<'PIX' | 'CARTAO'>;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class ServicoService {
  private readonly apiUrl = 'http://localhost:3000/servicos';

  constructor(private http: HttpClient) {}

  listar(empresaId?: number): Observable<Servico[]> {
    const filtro = empresaId ? `?empresaId=${empresaId}` : '';
    return this.http.get<Servico[]>(`${this.apiUrl}${filtro}`);
  }

  buscarPorId(id: number): Observable<Servico> {
    return this.http.get<Servico>(`${this.apiUrl}/${id}`);
  }

  criar(servico: Servico): Observable<Servico> {
    return this.http.post<Servico>(this.apiUrl, servico);
  }

  atualizar(servico: Servico): Observable<Servico> {
    return this.http.put<Servico>(`${this.apiUrl}/${servico.id}`, servico);
  }
}
