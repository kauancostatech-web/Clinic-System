# Clinic System

Projeto Integrador desenvolvido no segundo semestre do curso de Analise e Desenvolvimento de Sistemas.

O Clinic System e um prototipo de plataforma para agendamento de consultas. A ideia principal e permitir que pacientes encontrem profissionais de saude por especialidade, regiao, bairro, preco e horario disponivel. O projeto tambem possui uma area separada para clinicas cadastrarem profissionais, servicos e agenda.

## Objetivo

Criar uma aplicacao web simples para simular o fluxo de uma plataforma de consultas:

- o paciente pesquisa profissionais disponiveis;
- acessa o perfil publico do profissional;
- escolhe um dia e horario;
- faz login ou cadastro;
- confirma o pagamento;
- acompanha suas consultas na area do paciente;
- a clinica gerencia profissionais, servicos, agenda e pagamentos.

## Tecnologias utilizadas

- Angular
- TypeScript
- HTML
- CSS
- JSON Server
- Bootstrap Icons

## Estrutura principal

```text
src/app/pages
```

Contem as telas principais do sistema, como home, busca publica, perfil do profissional, login, cadastro, area do paciente e painel da empresa.

```text
src/app/services
```

Contem os services usados para acessar os dados do JSON Server e centralizar regras como autenticacao, pacientes, empresas, profissionais, agenda, agendamentos e pagamentos.

```text
backend/db.json
```

Arquivo usado pelo JSON Server para simular o banco de dados local do projeto.

## Funcionalidades

### Area publica

- Pagina inicial
- Busca de profissionais
- Filtro por cidade, regiao, bairro, especialidade, clinica e preco
- Perfil publico do profissional
- Avaliacoes do profissional
- Calendario com horarios disponiveis e ocupados
- Fluxo de agendamento
- Login e cadastro do paciente

### Area do paciente

- Visualizacao das consultas marcadas
- Status de pagamento
- Cancelamento com marcacao de reembolso
- Mensagens enviadas por profissionais
- Foto/avatar do paciente

### Area da empresa

- Login separado para clinicas
- Dashboard administrativo
- Cadastro de profissionais
- Cadastro de servicos
- Agenda de consultas
- Lista de pacientes
- Pagamentos
- Configuracoes da empresa

## Rotas principais

### Paciente e area publica

```text
/
/home
/buscar-atendimento
/detalhes-profissional/:id
/agendar-consulta/:id
/login-paciente
/cadastro-paciente
/dashboard-paciente
/pagamento/:id
/confirmacao-consulta
```

### Empresa

```text
/para-empresas
/login-empresa
/cadastro-empresa
/empresa/dashboard
/empresa/profissionais
/empresa/agenda
/empresa/pacientes
/empresa/servicos
/empresa/pagamentos
/empresa/configuracoes
```

## Dados de acesso para teste

Paciente:

```text
E-mail: maria@email.com
Senha: 123456
```

Empresa:

```text
E-mail: admin@clinica.com
Senha: 123456
```

Admin da plataforma:

```text
E-mail: admin@clinicsystem.local
Senha: admin123
```

## Como executar o projeto

Instale as dependencias:

```bash
npm install
```

Inicie o backend local:

```bash
npm run backend
```

Em outro terminal, inicie o Angular:

```bash
npm start
```

Acesse no navegador:

```text
http://localhost:4200
```

## Observacoes

Este projeto usa JSON Server para simular o backend. Por isso, os dados ficam em um arquivo local e podem ser alterados durante os testes.

O sistema foi desenvolvido com foco academico, para demonstrar organizacao de componentes, rotas, services, formularios, consumo de API local e separacao entre area publica, area do paciente e area administrativa da clinica.
