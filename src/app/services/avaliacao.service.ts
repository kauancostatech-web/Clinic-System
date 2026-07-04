import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AvaliacaoProfissional {
  id?: number;
  empresaId: number;
  profissionalId: number;
  pacienteId: number;
  pacienteNome: string;
  nota: number;
  comentario: string;
  criadoEm: string;
  consultaRealizada: boolean;
}

@Injectable({ providedIn: 'root' })
export class AvaliacaoService {
  private readonly apiUrl = 'http://localhost:3000/avaliacoes';

  constructor(private http: HttpClient) {}

  listarPorProfissional(profissionalId: number): Observable<AvaliacaoProfissional[]> {
    return this.http.get<AvaliacaoProfissional[]>(`${this.apiUrl}?profissionalId=${profissionalId}`);
  }

  criar(avaliacao: AvaliacaoProfissional): Observable<AvaliacaoProfissional> {
    return this.http.post<AvaliacaoProfissional>(this.apiUrl, avaliacao);
  }
}
