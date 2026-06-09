import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha: string;
  perfil: 'admin' | 'paciente';
}

export interface TokenRegistro {
  id?: number;
  email: string;
  token: string;
  criadoEm: string;
  status: 'gerado' | 'usado';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://127.0.0.1:3000';
  private readonly usuarioStorage = 'clinic-system-usuario';

  constructor(private http: HttpClient) {}

  login(email: string, senha: string): Observable<Usuario | undefined> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios?email=${email}&senha=${senha}`).pipe(
      map((usuarios) => usuarios[0]),
      tap((usuario) => {
        if (usuario && this.temLocalStorage()) {
          localStorage.setItem(this.usuarioStorage, JSON.stringify(usuario));
        }
      })
    );
  }

  cadastrar(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/usuarios`, usuario);
  }

  usuarioAtual(): Usuario | undefined {
    if (!this.temLocalStorage()) {
      return undefined;
    }

    const usuario = localStorage.getItem(this.usuarioStorage);
    return usuario ? JSON.parse(usuario) as Usuario : undefined;
  }

  sair(): void {
    if (!this.temLocalStorage()) {
      return;
    }

    localStorage.removeItem(this.usuarioStorage);
  }

  gerarTokenSenha(email: string): Observable<TokenRegistro> {
    return this.http.post<TokenRegistro>(`${this.apiUrl}/tokensSenha`, {
      email,
      token: this.gerarToken(),
      criadoEm: new Date().toISOString(),
      status: 'gerado'
    });
  }

  gerarTokenPagamento(email: string): Observable<TokenRegistro> {
    return this.http.post<TokenRegistro>(`${this.apiUrl}/tokensPagamento`, {
      email,
      token: this.gerarToken(),
      criadoEm: new Date().toISOString(),
      status: 'gerado'
    });
  }

  private gerarToken(): string {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  private temLocalStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
