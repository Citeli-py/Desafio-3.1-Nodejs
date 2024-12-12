# Desafio-3.1-Nodejs

Este projeto é um sistema para gerenciar pacientes, agendamentos e consultas. Para que ele funcione corretamente, é necessário configurar um arquivo `.env` com as credenciais do banco de dados.

## Pré-requisitos

- Node.js instalado
- PostgresSQL
- Gerenciador de pacotes (`npm` ou `yarn`)

## Configuração do Ambiente

Antes de executar o projeto, crie um arquivo `.env` na raiz do diretório do projeto com as seguintes variáveis de ambiente:

```plaintext
DATABASE=       # Nome do banco de dados
DB_USER=        # Usuário do banco de dados
DB_HOST=        # Endereço do banco de dados (exemplo: localhost)
DB_PASSWORD=    # Senha do banco de dados
```

## Instalação

```bash
npm install
```

## Execução
```bash
npm start
```