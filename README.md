# Clinic System

Sistema web para cadastro e gerenciamento de pacientes, desenvolvido com Angular.

O projeto faz parte de um sistema hospitalar em desenvolvimento e atualmente possui a tela de pacientes com cadastro, listagem, edicao e exclusao de registros.

## Objetivo

Facilitar o controle inicial de pacientes em uma clinica ou ambiente hospitalar, mantendo os dados principais organizados em uma interface simples e objetiva.

## Funcionalidades

- Cadastro de pacientes
- Listagem de pacientes cadastrados
- Edicao de dados do paciente
- Exclusao de pacientes
- Mensagens de sucesso e erro
- Integracao com uma API local usando JSON Server

## Tecnologias Utilizadas

- Angular 19
- TypeScript
- HTML
- CSS
- JSON Server
- Node.js / npm

## Estrutura Principal

```text
clinic-system/
├── backend/
│   └── db.json
├── src/
│   └── app/
│       └── pages/
│           └── pacientes/
├── angular.json
├── package.json
└── README.md
```

## Como Rodar o Projeto

Antes de iniciar, instale o Node.js LTS.

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

## API Local

O projeto usa o JSON Server como backend temporario.

Arquivo de dados:

```text
backend/db.json
```

Endereco da API:

```text
http://127.0.0.1:3000
```

Recurso principal:

```text
/pacientes
```

## Status do Projeto

Em desenvolvimento.

Modulo atual:

- Pacientes

Modulos planejados:

- Consultas
- Receitas
- Medicamentos

## Autor

Kauan Costa
