import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Empresa {
  id?: number;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  descricao: string;
  logo: string;
  ativo: boolean;
  aprovada: boolean;
  criadoEm: string;
}

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private readonly apiUrl = 'http://localhost:3000/empresas';

  constructor(private http: HttpClient) {}

  listar(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/${id}`);
  }

  criar(empresa: Empresa): Observable<Empresa> {
    return this.http.post<Empresa>(this.apiUrl, empresa);
  }

  atualizar(empresa: Empresa): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.apiUrl}/${Number(empresa.id)}`, empresa);
  }
}
