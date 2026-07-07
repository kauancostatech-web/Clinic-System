# Clinic System

Aplicação web para busca de profissionais da saúde, agendamento de consultas e gestão de atendimentos, desenvolvida com Angular, TypeScript e JSON Server.

O projeto integra diferentes fluxos de uso em uma única aplicação: pacientes podem pesquisar profissionais, consultar perfis e horários disponíveis, realizar agendamentos e acompanhar consultas; empresas da área da saúde contam com um ambiente administrativo para gerenciar profissionais, serviços, agenda, pacientes e pagamentos.

## Status do projeto

**Finalizado**

Atualmente o projeto possui:

* Área pública para busca de atendimentos
* Autenticação e cadastro de pacientes
* Ambiente dedicado ao paciente
* Ambiente administrativo para empresas
* Busca de profissionais com múltiplos filtros
* Perfil público de profissionais
* Avaliações
* Calendário de disponibilidade
* Fluxo de agendamento
* Fluxo de pagamento
* Gestão de consultas
* Gestão de profissionais
* Gestão de serviços
* Gestão de pacientes
* Acompanhamento de pagamentos
* Persistência local de dados com JSON Server

## Funcionalidades

### Busca e descoberta de atendimentos

* Pesquisa de profissionais da saúde
* Filtro por cidade
* Filtro por região
* Filtro por bairro
* Filtro por especialidade
* Filtro por clínica
* Filtro por preço
* Visualização do perfil público do profissional
* Consulta de avaliações

### Agendamentos

* Visualização de calendário
* Consulta de horários disponíveis
* Identificação de horários ocupados
* Seleção de data e horário
* Fluxo de agendamento de consulta
* Confirmação da consulta
* Integração do agendamento com a jornada do paciente

### Autenticação e pacientes

* Cadastro de paciente
* Login do paciente
* Área autenticada
* Identificação por foto ou avatar
* Visualização de consultas marcadas
* Acompanhamento do status de pagamento
* Cancelamento de consulta
* Marcação de reembolso
* Recebimento de mensagens enviadas por profissionais

### Empresas

* Cadastro de empresa
* Login separado
* Ambiente administrativo dedicado
* Dashboard empresarial
* Configurações da empresa

### Profissionais

* Cadastro de profissionais
* Gerenciamento de profissionais
* Associação ao ambiente empresarial
* Exibição pública de profissionais
* Perfil individual
* Disponibilidade para agendamento

### Serviços

* Cadastro de serviços
* Gerenciamento de serviços
* Organização dos atendimentos oferecidos

### Agenda

* Gestão de consultas
* Organização de horários
* Visualização de agendamentos
* Controle de disponibilidade

### Pagamentos

* Fluxo de pagamento
* Acompanhamento do status
* Visualização de pagamentos no ambiente empresarial
* Marcação de reembolso em cancelamentos

## Tecnologias utilizadas

* Angular
* TypeScript
* HTML
* CSS
* JSON Server
* Bootstrap Icons
* npm

## Conceitos aplicados

* Componentização de interfaces
* Roteamento com Angular
* Rotas parametrizadas
* Organização por páginas
* Separação de responsabilidades
* Services para acesso e manipulação de dados
* Consumo de API HTTP
* Formulários
* Autenticação por contexto de acesso
* Persistência de sessão
* Gerenciamento de estado de interface
* Filtros de pesquisa
* Fluxos de navegação
* Integração entre agendamento e disponibilidade
* Separação entre área pública e áreas autenticadas
* Organização de aplicação por domínios funcionais

## Organização dos serviços

A aplicação utiliza services para centralizar o acesso aos dados e responsabilidades relacionadas aos principais domínios do sistema:

* Autenticação
* Pacientes
* Empresas
* Profissionais
* Agenda
* Agendamentos
* Pagamentos

## Principais rotas

### Área pública e paciente

| Rota                         | Finalidade                            |
| ---------------------------- | ------------------------------------- |
| `/`                          | Entrada da aplicação                  |
| `/home`                      | Página inicial                        |
| `/buscar-atendimento`        | Busca de profissionais e atendimentos |
| `/detalhes-profissional/:id` | Perfil público do profissional        |
| `/agendar-consulta/:id`      | Fluxo de agendamento                  |
| `/login-paciente`            | Autenticação do paciente              |
| `/cadastro-paciente`         | Cadastro do paciente                  |
| `/dashboard-paciente`        | Área autenticada do paciente          |
| `/pagamento/:id`             | Etapa de pagamento                    |
| `/confirmacao-consulta`      | Confirmação do agendamento            |

### Área da empresa

| Rota                     | Finalidade                           |
| ------------------------ | ------------------------------------ |
| `/para-empresas`         | Apresentação do ambiente empresarial |
| `/login-empresa`         | Autenticação da empresa              |
| `/cadastro-empresa`      | Cadastro da empresa                  |
| `/empresa/dashboard`     | Dashboard administrativo             |
| `/empresa/profissionais` | Gestão de profissionais              |
| `/empresa/agenda`        | Gestão da agenda                     |
| `/empresa/pacientes`     | Gestão de pacientes                  |
| `/empresa/servicos`      | Gestão de serviços                   |
| `/empresa/pagamentos`    | Acompanhamento de pagamentos         |
| `/empresa/configuracoes` | Configurações da empresa             |

## Estrutura do projeto

```text
Clinic-System/
├── backend/
│   └── db.json
├── public/
├── src/
│   └── app/
│       ├── pages/
│       └── services/
├── angular.json
├── package.json
├── tsconfig.app.json
├── tsconfig.json
└── README.md
```

### `src/app/pages`

Contém as principais páginas e experiências da aplicação, incluindo:

* página inicial;
* busca pública;
* perfil do profissional;
* autenticação;
* cadastro;
* área do paciente;
* painel da empresa.

### `src/app/services`

Centraliza o acesso aos dados e as responsabilidades relacionadas aos diferentes domínios da aplicação.

### `backend/db.json`

Base local utilizada pelo JSON Server para simular persistência de dados e integração entre os fluxos do sistema.

## Como executar localmente

### Pré-requisitos

* Node.js
* npm
* Angular CLI

### Clone o repositório

```bash
git clone https://github.com/kauancostatech-web/Clinic-System.git
```

### Acesse o diretório

```bash
cd Clinic-System
```

### Instale as dependências

```bash
npm install
```

### Inicie o backend local

```bash
npm run backend
```

O JSON Server será iniciado em:

```text
http://localhost:3000
```

### Inicie a aplicação

Em outro terminal:

```bash
npm start
```

A aplicação estará disponível em:

```text
http://localhost:4200
```

## Dados de demonstração

O projeto utiliza JSON Server para simular a persistência e o acesso aos dados durante a execução local.

Os registros utilizados no ambiente de demonstração devem ser tratados como dados fictícios destinados exclusivamente à apresentação e avaliação do projeto.

## Contexto acadêmico

Projeto Integrador desenvolvido durante o segundo semestre do curso de Análise e Desenvolvimento de Sistemas.

O desenvolvimento teve como objetivo aplicar conceitos de desenvolvimento web na construção de uma aplicação com múltiplos fluxos, diferentes contextos de acesso e integração entre busca, disponibilidade, agendamento, pagamento e gestão administrativa.

## Autor

**Kauan Costa**

Estudante de Análise e Desenvolvimento de Sistemas.

📧 **E-mail:** [kauancosta.tech@gmail.com](mailto:kauancosta.tech@gmail.com)

