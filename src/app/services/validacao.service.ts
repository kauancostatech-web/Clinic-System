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

    const calcularDigito = (base: string, pesoInicial: number) => {
      const soma = base.split('').reduce((total, numero, index) => total + Number(numero) * (pesoInicial - index), 0);
      const resto = (soma * 10) % 11;
      return resto === 10 ? 0 : resto;
    };

    return calcularDigito(cpf.slice(0, 9), 10) === Number(cpf[9]) && calcularDigito(cpf.slice(0, 10), 11) === Number(cpf[10]);
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

    const calcularDigito = (base: string, pesos: number[]) => {
      const soma = base.split('').reduce((total, numero, index) => total + Number(numero) * pesos[index], 0);
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const primeiro = calcularDigito(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const segundo = calcularDigito(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    return primeiro === Number(cnpj[12]) && segundo === Number(cnpj[13]);
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

  verificarCpfDuplicado(cpf: string): Observable<boolean> {
    const documento = this.formatarCpf(cpf);
    return this.http.get<any[]>(`${this.apiUrl}/pacientes?cpf=${documento}`).pipe(map((pacientes) => pacientes.length > 0));
  }

  verificarCnpjDuplicado(cnpj: string): Observable<boolean> {
    const documento = this.formatarCnpj(cnpj);
    return this.http.get<any[]>(`${this.apiUrl}/empresas?cnpj=${documento}`).pipe(map((empresas) => empresas.length > 0));
  }
}
