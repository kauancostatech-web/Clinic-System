import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

export interface ConsultaCnpj {
  razaoSocial?: string;
  nomeFantasia?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  situacaoCadastral?: string;
}

export interface ConsultaCep {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  enderecoCompleto: string;
}

@Injectable({
  providedIn: 'root'
})
export class ValidacaoService {
  private readonly apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  apenasNumeros(valor: string): string {
    return (valor || '').replace(/\D/g, '');
  }

  formatarCpf(valor: string): string {
    return this.apenasNumeros(valor)
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  validarCpf(valor: string): boolean {
    const cpf = this.apenasNumeros(valor);
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
      return false;
    }

    return true;
  }

  formatarCnpj(valor: string): string {
    return this.apenasNumeros(valor)
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }

  validarCnpj(valor: string): boolean {
    const cnpj = this.apenasNumeros(valor);
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
      return false;
    }

    return true;
  }

  formatarTelefone(valor: string): string {
    return this.apenasNumeros(valor)
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }

  formatarCep(valor: string): string {
    return this.apenasNumeros(valor).slice(0, 8).replace(/(\d{5})(\d{1,3})$/, '$1-$2');
  }

  validarCep(valor: string): boolean {
    return this.apenasNumeros(valor).length === 8;
  }

  validarTelefone(valor: string): boolean {
    const telefone = this.apenasNumeros(valor);
    return telefone.length === 10 || telefone.length === 11;
  }

  validarEmail(valor: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor || '');
  }

  consultarCnpj(cnpj: string): Observable<ConsultaCnpj | null> {
    const normalizado = this.apenasNumeros(cnpj);
    if (normalizado.length !== 14) {
      return of(null);
    }

    return this.http.get<any>(`https://brasilapi.com.br/api/cnpj/v1/${normalizado}`).pipe(
      map((dados) => ({
        razaoSocial: dados.razao_social,
        nomeFantasia: dados.nome_fantasia,
        endereco: [dados.logradouro, dados.numero, dados.bairro].filter(Boolean).join(', '),
        cidade: dados.municipio,
        estado: dados.uf,
        telefone: dados.ddd_telefone_1 ? this.formatarTelefone(dados.ddd_telefone_1) : '',
        situacaoCadastral: dados.descricao_situacao_cadastral
      })),
      catchError(() => of(null))
    );
  }

  consultarCep(cep: string): Observable<ConsultaCep | null> {
    const normalizado = this.apenasNumeros(cep);
    if (normalizado.length !== 8) {
      return of(null);
    }

    return this.http.get<any>(`https://viacep.com.br/ws/${normalizado}/json/`).pipe(
      map((dados) => {
        if (dados?.erro) {
          return null;
        }

        const logradouro = dados.logradouro || '';
        const bairro = dados.bairro || '';
        const cidade = dados.localidade || '';
        const estado = dados.uf || '';

        return {
          cep: this.formatarCep(normalizado),
          logradouro,
          bairro,
          cidade,
          estado,
          enderecoCompleto: [logradouro, bairro, cidade, estado].filter(Boolean).join(', ')
        };
      }),
      catchError(() => of(null))
    );
  }

  verificarCpfDuplicado(cpf: string): Observable<boolean> {
    const documento = this.formatarCpf(cpf);
    return this.http.get<any[]>(`${this.apiUrl}/pacientes`).pipe(
      map((pacientes) => pacientes.some((paciente) => this.apenasNumeros(paciente.cpf) === this.apenasNumeros(documento)))
    );
  }

  verificarCnpjDuplicado(cnpj: string): Observable<boolean> {
    const documento = this.formatarCnpj(cnpj);
    return this.http.get<any[]>(`${this.apiUrl}/empresas`).pipe(
      map((empresas) => empresas.some((empresa) => this.apenasNumeros(empresa.cnpj) === this.apenasNumeros(documento)))
    );
  }
}
