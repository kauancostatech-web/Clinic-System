import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type StatusPagamento = 'PAGO' | 'PENDENTE' | 'CANCELADO' | 'REEMBOLSADO';

export interface Pagamento {
  id?: number;
  empresaId: number;
  pacienteId: number;
  agendamentoId: number;
  valor: number;
  metodo: 'PIX' | 'CARTAO' | 'DINHEIRO';
  status: StatusPagamento;
  criadoEm: string;
}

@Injectable({ providedIn: 'root' })
export class PagamentoService {
  private readonly apiUrl = 'http://localhost:3000/pagamentos';

  constructor(private http: HttpClient) {}

  listarPorEmpresa(empresaId: number): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(`${this.apiUrl}?empresaId=${empresaId}`);
  }

  listarPorPaciente(pacienteId: number): Observable<Pagamento[]> {
    return this.http.get<Pagamento[]>(`${this.apiUrl}?pacienteId=${pacienteId}`);
  }

  criar(pagamento: Pagamento): Observable<Pagamento> {
    return this.http.post<Pagamento>(this.apiUrl, pagamento);
  }

  atualizar(pagamento: Pagamento): Observable<Pagamento> {
    return this.http.put<Pagamento>(`${this.apiUrl}/${pagamento.id}`, pagamento);
  }
}
