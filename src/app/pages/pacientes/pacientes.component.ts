import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Paciente } from './paciente.model';
import { PacientesService } from './pacientes.service';
@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css']
})
export class PacientesComponent implements OnInit {

  nome: string = '';
  cpf: string = '';
  telefone: string = '';
  idEditando?: number;
  mensagem: string = '';

  pacientes: Paciente[] = [];
  carregando: boolean = false;
  salvando: boolean = false;
  excluindoId?: number;

  constructor(private pacientesService: PacientesService) {}

  ngOnInit() {
    this.listar();
  }

  listar() {
    this.carregando = true;

    this.pacientesService.listar().subscribe({
      next: (pacientes) => {
        this.pacientes = pacientes;
        this.mensagem = '';
        this.carregando = false;
      },
      error: () => {
        this.mensagem = 'Erro ao carregar pacientes. Verifique se o JSON Server esta rodando na porta 3000.';
        this.carregando = false;
      }
    });
  }

  salvar() {
    const nome = this.nome.trim();
    const cpf = this.cpf.trim();
    const telefone = this.telefone.trim();

    if (!nome || !cpf || !telefone) {
      this.mensagem = 'Preencha todos os campos.';
      return;
    }

    const paciente: Paciente = {
      nome,
      cpf,
      telefone
    };

    this.salvando = true;
    this.mensagem = '';

    if (this.idEditando !== undefined) {
      paciente.id = this.idEditando;

      this.pacientesService.atualizar(paciente).subscribe({
        next: (pacienteAtualizado) => {
          this.pacientes = this.pacientes.map((pacienteLista) =>
            pacienteLista.id === pacienteAtualizado.id ? pacienteAtualizado : pacienteLista
          );
          this.mensagem = 'Paciente atualizado com sucesso.';
          this.limparFormulario();
          this.salvando = false;
        },
        error: (erro: HttpErrorResponse) => {
          this.mensagem = this.mensagemErro('atualizar', erro);
          this.salvando = false;
        }
      });
      return;
    }

    this.pacientesService.cadastrar(paciente).subscribe({
      next: (pacienteCadastrado) => {
        this.pacientes = [...this.pacientes, pacienteCadastrado];
        this.mensagem = 'Paciente cadastrado com sucesso.';
        this.limparFormulario();
        this.salvando = false;
      },
      error: (erro: HttpErrorResponse) => {
        this.mensagem = this.mensagemErro('cadastrar', erro);
        this.salvando = false;
      }
    });
  }

  editar(paciente: Paciente) {
    this.idEditando = paciente.id;
    this.nome = paciente.nome;
    this.cpf = paciente.cpf;
    this.telefone = paciente.telefone;
    this.mensagem = '';
  }

  excluir(paciente: Paciente) {
    if (!paciente.id) {
      return;
    }

    this.excluindoId = paciente.id;
    this.mensagem = '';

    this.pacientesService.excluir(paciente.id).subscribe({
      next: () => {
        this.pacientes = this.pacientes.filter((pacienteLista) => pacienteLista.id !== paciente.id);
        this.mensagem = 'Paciente excluido com sucesso.';
        this.excluindoId = undefined;
      },
      error: (erro: HttpErrorResponse) => {
        this.mensagem = this.mensagemErro('excluir', erro);
        this.excluindoId = undefined;
      }
    });
  }

  cancelarEdicao() {
    this.limparFormulario();
  }

  limparFormulario() {
    this.idEditando = undefined;
    this.nome = '';
    this.cpf = '';
    this.telefone = '';
    this.salvando = false;
  }

  private mensagemErro(acao: string, erro: HttpErrorResponse): string {
    if (erro.status === 0) {
      return `Erro ao ${acao} paciente. Verifique se o JSON Server esta rodando em http://127.0.0.1:3000.`;
    }

    return `Erro ao ${acao} paciente. Status: ${erro.status}.`;
  }
}
