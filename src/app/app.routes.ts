import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CadastroPacienteComponent } from './pages/cadastro-paciente/cadastro-paciente.component';
import { LoginPacienteComponent } from './pages/login-paciente/login-paciente.component';
import { LoginEmpresaComponent } from './pages/login-empresa/login-empresa.component';
import { PacienteComponent } from './pages/paciente/paciente.component';
import { DashboardEmpresaComponent } from './pages/dashboard-empresa/dashboard-empresa.component';
import { BuscaPublicaComponent } from './pages/busca-publica/busca-publica.component';
import { PerfilPublicoComponent } from './pages/perfil-publico/perfil-publico.component';
import { ParaEmpresasComponent } from './pages/para-empresas/para-empresas.component';
import { CadastroEmpresaComponent } from './pages/cadastro-empresa/cadastro-empresa.component';
import { AgendarConsultaComponent } from './pages/agendar-consulta/agendar-consulta.component';
import { PagamentoComponent } from './pages/pagamento/pagamento.component';
import { ConfirmacaoConsultaComponent } from './pages/confirmacao-consulta/confirmacao-consulta.component';
import { AdminPlataformaComponent } from './pages/admin-plataforma/admin-plataforma.component';
import { protegerRota } from './services/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login-paciente', component: LoginPacienteComponent },
  { path: 'cadastro-paciente', component: CadastroPacienteComponent },
  { path: 'dashboard-paciente', component: PacienteComponent, canActivate: [protegerRota(['PACIENTE'])] },
  { path: 'buscar-atendimento', component: BuscaPublicaComponent },
  { path: 'detalhes-profissional/:id', component: PerfilPublicoComponent },
  { path: 'agendar-consulta/:id', component: AgendarConsultaComponent },
  { path: 'pagamento/:id', component: PagamentoComponent, canActivate: [protegerRota(['PACIENTE'])] },
  { path: 'confirmacao-consulta', component: ConfirmacaoConsultaComponent, canActivate: [protegerRota(['PACIENTE'])] },
  { path: 'minhas-consultas', component: PacienteComponent, canActivate: [protegerRota(['PACIENTE'])] },
  { path: 'historico-paciente', component: PacienteComponent, canActivate: [protegerRota(['PACIENTE'])] },
  { path: 'perfil-paciente', component: PacienteComponent, canActivate: [protegerRota(['PACIENTE'])] },
  { path: 'para-empresas', component: ParaEmpresasComponent },
  { path: 'login-empresa', component: LoginEmpresaComponent },
  { path: 'empresa/login', redirectTo: 'login-empresa', pathMatch: 'full' },
  { path: 'cadastro-empresa', component: CadastroEmpresaComponent },
  { path: 'empresa/dashboard', component: DashboardEmpresaComponent, canActivate: [protegerRota(['EMPRESA_ADMIN'])] },
  { path: 'empresa/profissionais', component: DashboardEmpresaComponent, canActivate: [protegerRota(['EMPRESA_ADMIN'])] },
  { path: 'empresa/agenda', component: DashboardEmpresaComponent, canActivate: [protegerRota(['EMPRESA_ADMIN'])] },
  { path: 'empresa/pacientes', component: DashboardEmpresaComponent, canActivate: [protegerRota(['EMPRESA_ADMIN'])] },
  { path: 'empresa/servicos', component: DashboardEmpresaComponent, canActivate: [protegerRota(['EMPRESA_ADMIN'])] },
  { path: 'empresa/valores', component: DashboardEmpresaComponent, canActivate: [protegerRota(['EMPRESA_ADMIN'])] },
  { path: 'empresa/pagamentos', component: DashboardEmpresaComponent, canActivate: [protegerRota(['EMPRESA_ADMIN'])] },
  { path: 'empresa/relatorios', component: DashboardEmpresaComponent, canActivate: [protegerRota(['EMPRESA_ADMIN'])] },
  { path: 'empresa/configuracoes', component: DashboardEmpresaComponent, canActivate: [protegerRota(['EMPRESA_ADMIN'])] },
  { path: 'empresa/perfil', component: DashboardEmpresaComponent, canActivate: [protegerRota(['EMPRESA_ADMIN'])] },
  { path: 'dashboard-empresa', redirectTo: 'empresa/dashboard', pathMatch: 'full' },
  { path: 'profissionais', redirectTo: 'empresa/profissionais', pathMatch: 'full' },
  { path: 'agenda', redirectTo: 'empresa/agenda', pathMatch: 'full' },
  { path: 'pacientes', redirectTo: 'empresa/pacientes', pathMatch: 'full' },
  { path: 'servicos', redirectTo: 'empresa/servicos', pathMatch: 'full' },
  { path: 'valores', redirectTo: 'empresa/valores', pathMatch: 'full' },
  { path: 'pagamentos', redirectTo: 'empresa/pagamentos', pathMatch: 'full' },
  { path: 'relatorios', redirectTo: 'empresa/relatorios', pathMatch: 'full' },
  { path: 'configuracoes', redirectTo: 'empresa/configuracoes', pathMatch: 'full' },
  { path: 'perfil-empresa', redirectTo: 'empresa/perfil', pathMatch: 'full' },
  { path: 'login-admin', component: AdminPlataformaComponent },
  { path: 'login-adm', redirectTo: 'login-admin', pathMatch: 'full' },
  { path: 'admin', redirectTo: 'login-admin', pathMatch: 'full' },
  { path: 'adm', redirectTo: 'login-admin', pathMatch: 'full' },
  { path: 'dashboard-admin', component: AdminPlataformaComponent, canActivate: [protegerRota(['ADMIN_PLATAFORMA'])] },
  { path: 'dashboard-adm', redirectTo: 'dashboard-admin', pathMatch: 'full' },
  { path: 'empresas', component: AdminPlataformaComponent, canActivate: [protegerRota(['ADMIN_PLATAFORMA'])] },
  { path: 'aprovacao-empresas', component: AdminPlataformaComponent, canActivate: [protegerRota(['ADMIN_PLATAFORMA'])] },
  { path: 'buscar', redirectTo: 'buscar-atendimento', pathMatch: 'full' },
  { path: 'pacientes/cadastro', redirectTo: 'cadastro-paciente', pathMatch: 'full' },
  { path: 'pacientes/entrar', redirectTo: 'login-paciente', pathMatch: 'full' },
  { path: 'cadastro', redirectTo: 'cadastro-paciente', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
