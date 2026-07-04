import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  usuarioLogado?: Usuario;

  constructor(private authService: AuthService) {
    this.usuarioLogado = this.authService.usuarioAtual();
  }

  get estaLogadoComoPaciente(): boolean {
    return this.authService.temPerfil(['PACIENTE']);
  }

  get fotoUsuario(): string {
    return this.usuarioLogado?.fotoUrl || this.usuarioLogado?.foto || this.usuarioLogado?.avatar || '';
  }

  get iniciaisUsuario(): string {
    const nome = this.usuarioLogado?.nome || 'Paciente';
    return nome.split(' ').slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();
  }
}
