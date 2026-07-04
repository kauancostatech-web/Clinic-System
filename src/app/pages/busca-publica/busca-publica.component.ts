import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { Especialidade, Medico, PortalApiService, Unidade } from '../../services/portal-api.service';

@Component({
  selector: 'app-busca-publica',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './busca-publica.component.html',
  styleUrl: './busca-publica.component.css'
})
export class BuscaPublicaComponent implements OnInit {
  termo = '';
  cidade = 'São Paulo, Brasil';
  regiao = '';
  bairro = '';
  localAtendimento = '';
  especialidade = '';
  precoMaximo = '';
  ordenacao = 'menor-preco';
  medicos: Medico[] = [];
  locais: Unidade[] = [];
  especialidades: Especialidade[] = [];
  bairrosMetropolitanos = [
    'Bela Vista',
    'Mooca',
    'Tatuapé',
    'Pinheiros',
    'Vila Mariana',
    'Santana',
    'Santo Amaro',
    'Itaquera',
    'Penha',
    'Lapa',
    'Osasco',
    'Guarulhos',
    'Santo André',
    'São Bernardo do Campo',
    'São Caetano do Sul',
    'Diadema',
    'Barueri'
  ];
  regioes = [
    { nome: 'Centro e Paulista', bairros: ['Bela Vista', 'Liberdade', 'Sé', 'Consolação'] },
    { nome: 'Zona Sul', bairros: ['Vila Mariana', 'Santo Amaro', 'Moema', 'Campo Belo', 'Jabaquara'] },
    { nome: 'Zona Oeste', bairros: ['Pinheiros', 'Lapa', 'Perdizes', 'Butantã'] },
    { nome: 'Zona Leste', bairros: ['Mooca', 'Tatuapé', 'Itaquera', 'Penha'] },
    { nome: 'Zona Norte', bairros: ['Santana', 'Tucuruvi', 'Casa Verde'] },
    { nome: 'Grande São Paulo', bairros: ['Osasco', 'Guarulhos', 'Santo André', 'São Bernardo do Campo', 'São Caetano do Sul', 'Diadema', 'Barueri'] }
  ];

  constructor(private portalApi: PortalApiService, private authService: AuthService) {}

  ngOnInit() {
    this.portalApi.listarMedicos().subscribe((medicos) => this.medicos = medicos);
    this.portalApi.listarUnidades().subscribe((locais) => this.locais = locais);
    this.portalApi.listarEspecialidades().subscribe((especialidades) => this.especialidades = especialidades);
  }

  get cidades(): string[] {
    return Array.from(new Set([...this.medicos.map((item) => item.cidade), ...this.locais.map((item) => item.cidade)].filter(Boolean) as string[]));
  }

  get bairros(): string[] {
    return Array.from(new Set([...this.bairrosMetropolitanos, ...this.medicos.map((item) => item.bairro), ...this.locais.map((item) => item.bairro)].filter(Boolean) as string[]));
  }

  get bairrosDisponiveis(): string[] {
    if (!this.regiao) {
      return this.bairros;
    }

    const regiao = this.regioes.find((item) => item.nome === this.regiao);
    return regiao?.bairros || this.bairros;
  }

  get locaisAtendimento(): string[] {
    return Array.from(new Set(this.medicos.map((item) => item.localAtendimento).filter(Boolean) as string[])).sort();
  }

  get medicosFiltrados(): Medico[] {
    const filtrados = this.medicos.filter((medico) => this.combinaBusca(
      medico.nome,
      `${medico.especialidade} ${medico.servicos?.join(' ') || ''} ${medico.localAtendimento || ''}`,
      medico.cidade,
      medico.bairro,
      medico.localAtendimento,
      medico.valorNumero
    ));

    return filtrados.sort((a, b) => {
      if (this.ordenacao === 'proximo-horario') {
        return `${a.proximaDisponibilidade || '9999'} ${a.horarioDisponivel || '99:99'}`.localeCompare(`${b.proximaDisponibilidade || '9999'} ${b.horarioDisponivel || '99:99'}`);
      }

      return (a.valorNumero || 999999) - (b.valorNumero || 999999);
    });
  }

  get totalHorariosDisponiveis(): number {
    return this.medicos.filter((medico) => medico.horarioDisponivel).length;
  }

  get especialidadesDisponiveis(): number {
    return this.especialidades.length;
  }

  get estaLogadoComoPaciente(): boolean {
    return this.authService.temPerfil(['PACIENTE']);
  }

  get usuarioLogado(): Usuario | undefined {
    return this.authService.usuarioAtual();
  }

  get fotoUsuario(): string {
    const usuario = this.usuarioLogado;
    return usuario?.fotoUrl || usuario?.foto || usuario?.avatar || '';
  }

  get iniciaisUsuario(): string {
    const nome = this.usuarioLogado?.nome || 'Paciente';
    return nome.split(' ').slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();
  }

  aoTrocarRegiao() {
    if (this.bairro && !this.bairrosDisponiveis.includes(this.bairro)) {
      this.bairro = '';
    }
  }

  limparFiltros() {
    this.termo = '';
    this.cidade = 'São Paulo, Brasil';
    this.regiao = '';
    this.bairro = '';
    this.localAtendimento = '';
    this.especialidade = '';
    this.precoMaximo = '';
    this.ordenacao = 'menor-preco';
  }

  private combinaBusca(nome = '', especialidades = '', cidade = '', bairro = '', localAtendimento = '', valor?: number): boolean {
    const texto = this.normalizar(`${nome} ${especialidades} ${cidade} ${bairro} ${localAtendimento}`);
    const termoOk = !this.termo || texto.includes(this.normalizar(this.termo));
    const cidadeOk = !this.cidade || cidade === this.cidade;
    const regiaoOk = !this.regiao || this.bairroEstaNaRegiao(bairro, this.regiao);
    const bairroOk = !this.bairro || bairro === this.bairro;
    const localOk = !this.localAtendimento || localAtendimento === this.localAtendimento;
    const especialidadeOk = !this.especialidade || this.normalizar(especialidades).includes(this.normalizar(this.especialidade));
    const precoOk = !this.precoMaximo || (valor || 0) <= Number(this.precoMaximo);

    return termoOk && cidadeOk && regiaoOk && bairroOk && localOk && especialidadeOk && precoOk;
  }

  private bairroEstaNaRegiao(bairro: string, regiaoNome: string): boolean {
    const regiao = this.regioes.find((item) => item.nome === regiaoNome);
    return !regiao || regiao.bairros.includes(bairro);
  }

  private normalizar(texto = ''): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}
