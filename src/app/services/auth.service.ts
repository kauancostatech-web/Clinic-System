import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';

export type PerfilUsuario = 'PACIENTE' | 'EMPRESA_ADMIN' | 'PROFISSIONAL' | 'ADMIN_PLATAFORMA';

export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario | 'admin' | 'paciente' | 'medico' | 'clinica';
  empresaId?: number | null;
  pacienteId?: number | null;
  ativo?: boolean;
  cpf?: string;
  cnpj?: string;
  telefone?: string;
  fotoUrl?: string;
  foto?: string;
  avatar?: string;
  tipo?: string;
  localPreferido?: string;
  especialidadePreferida?: string;
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
  private readonly apiUrl = 'http://localhost:3000';
  private readonly usuarioStorage = 'clinic-system-usuario';
  private readonly usuarioStorageLegado = 'usuarioLogado';

  constructor(private http: HttpClient) {}

  login(email: string, senha: string, perfil?: PerfilUsuario | 'paciente' | 'medico' | 'clinica' | 'admin'): Observable<Usuario | undefined> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios?email=${email}&senha=${senha}`).pipe(
      map((usuarios) => {
        const perfilNormalizado = this.normalizarPerfil(perfil);
        const usuario = usuarios.find((item) => {
          const perfilUsuario = this.normalizarPerfil(item.perfil);
          return !perfilNormalizado || perfilUsuario === perfilNormalizado;
        });
        return perfil ? usuario : usuarios[0];
      }),
      switchMap((usuario) => this.hidratarUsuario(usuario)),
      tap((usuario) => this.salvarUsuarioLocal(usuario))
    );
  }

  cadastrar(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/usuarios`, usuario);
  }

  usuarioAtual(): Usuario | undefined {
    if (!this.temLocalStorage()) {
      return undefined;
    }

    const usuario = localStorage.getItem(this.usuarioStorage) || localStorage.getItem(this.usuarioStorageLegado);
    return usuario ? JSON.parse(usuario) as Usuario : undefined;
  }

  sair(): void {
    if (!this.temLocalStorage()) {
      return;
    }

    localStorage.removeItem(this.usuarioStorage);
    localStorage.removeItem(this.usuarioStorageLegado);
  }

  atualizarUsuarioLocal(dados: Partial<Usuario>): Usuario | undefined {
    const usuario = this.usuarioAtual();
    if (!usuario) {
      return undefined;
    }

    const atualizado = { ...usuario, ...dados };
    this.salvarUsuarioLocal(atualizado);
    return atualizado;
  }

  estaLogado(): boolean {
    return !!this.usuarioAtual();
  }

  temPerfil(perfis: PerfilUsuario[]): boolean {
    const usuario = this.usuarioAtual();
    if (!usuario) {
      return false;
    }

    return perfis.includes(this.normalizarPerfil(usuario.perfil) as PerfilUsuario);
  }

  empresaAtualId(): number | null {
    const usuario = this.usuarioAtual();
    return usuario?.empresaId ? Number(usuario.empresaId) : null;
  }

  pacienteAtualId(): number | null {
    const usuario = this.usuarioAtual();
    return usuario?.pacienteId ? Number(usuario.pacienteId) : null;
  }

  gerarTokenSenha(email: string): Observable<TokenRegistro> {
    return this.http.post<TokenRegistro>(`${this.apiUrl}/tokensSenha`, {
      email,
      token: this.gerarToken(),
      criadoEm: new Date().toISOString(),
      status: 'gerado'
    });
  }

  solicitarRecuperacaoSenha(email: string): Observable<TokenRegistro> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios?email=${email}`).pipe(
      switchMap((usuarios) => {
        const usuario = usuarios.find((item) => this.normalizarPerfil(item.perfil) === 'PACIENTE');
        if (!usuario) {
          return throwError(() => new Error('Paciente não encontrado.'));
        }

        return this.gerarTokenSenha(email);
      })
    );
  }

  redefinirSenhaComToken(email: string, token: string, novaSenha: string): Observable<Usuario> {
    return this.http.get<TokenRegistro[]>(`${this.apiUrl}/tokensSenha?email=${email}&token=${token}&status=gerado`).pipe(
      switchMap((tokens) => {
        const tokenAtivo = tokens[0];
        if (!tokenAtivo?.id) {
          return throwError(() => new Error('Token inválido.'));
        }

        return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios?email=${email}`).pipe(
          switchMap((usuarios) => {
            const usuario = usuarios.find((item) => this.normalizarPerfil(item.perfil) === 'PACIENTE');
            if (!usuario?.id) {
              return throwError(() => new Error('Paciente não encontrado.'));
            }

            return this.http.put<Usuario>(`${this.apiUrl}/usuarios/${usuario.id}`, { ...usuario, senha: novaSenha }).pipe(
              switchMap((usuarioAtualizado) => this.http.put<TokenRegistro>(`${this.apiUrl}/tokensSenha/${tokenAtivo.id}`, { ...tokenAtivo, status: 'usado' }).pipe(
                map(() => usuarioAtualizado)
              ))
            );
          })
        );
      })
    );
  }

  private gerarToken(): string {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  private hidratarUsuario(usuario?: Usuario): Observable<Usuario | undefined> {
    if (!usuario?.pacienteId) {
      return of(usuario);
    }

    return this.http.get<{ nome?: string; fotoUrl?: string; email?: string }>(`${this.apiUrl}/pacientes/${usuario.pacienteId}`).pipe(
      map((paciente) => ({
        ...usuario,
        nome: usuario.nome || paciente.nome || 'Paciente',
        email: usuario.email || paciente.email || '',
        fotoUrl: usuario.fotoUrl || paciente.fotoUrl || ''
      })),
      catchError(() => of(usuario))
    );
  }

  private salvarUsuarioLocal(usuario?: Usuario): void {
    if (!usuario || !this.temLocalStorage()) {
      return;
    }

    const usuarioPersistente: Usuario = {
      ...usuario,
      fotoUrl: usuario.fotoUrl || usuario.foto || usuario.avatar || '',
      tipo: this.normalizarPerfil(usuario.perfil)
    };

    localStorage.setItem(this.usuarioStorage, JSON.stringify(usuarioPersistente));
    localStorage.setItem(this.usuarioStorageLegado, JSON.stringify(usuarioPersistente));
  }

  private normalizarPerfil(perfil?: Usuario['perfil'] | null): PerfilUsuario | undefined {
    if (!perfil) {
      return undefined;
    }

    const mapa: Record<string, PerfilUsuario> = {
      paciente: 'PACIENTE',
      medico: 'EMPRESA_ADMIN',
      clinica: 'EMPRESA_ADMIN',
      admin: 'ADMIN_PLATAFORMA',
      PACIENTE: 'PACIENTE',
      EMPRESA_ADMIN: 'EMPRESA_ADMIN',
      PROFISSIONAL: 'PROFISSIONAL',
      ADMIN_PLATAFORMA: 'ADMIN_PLATAFORMA'
    };

    return mapa[perfil];
  }

  private temLocalStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }
}
