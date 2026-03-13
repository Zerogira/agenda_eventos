# Documento Técnico: Agenda de Eventos

## 1. Contexto Geral
A aplicação é um sistema de gestão de eventos (ERP simplificado) focado em empresas de locação de brinquedos e recreação. O sistema é multi-tenancy (lógico), onde todos os dados (clientes, funcionários, eventos, brinquedos) são isolados por uma Empresa. O acesso é protegido via autenticação JWT.

## 2. Principais Funcionalidades
- **Autenticação**: Login e Registro de usuários vinculados a uma empresa.
- **Gestão de Recursos**: CRUD de Funcionários e Brinquedos (com controle de estoque/quantidade).
- **Gestão de Clientes**: Cadastro de contratantes.
- **Gestão de Eventos**:
  - Agendamento com validação de datas.
  - Alocação de brinquedos (com quantidade específica por evento).
  - Escala de funcionários para o evento.
  - Controle de status (Agendado, Confirmado, Finalizado, Cancelado).
- **Dashboard**: Estrutura pronta, pendente implementação de gráficos.

## 3. Entidades e Modelo de Dados
O banco de dados (PostgreSQL) segue o seguinte esquema relacional:

- **Empresa**: Raiz do sistema. Todos os registros abaixo possuem `empresa_id`.
- **Usuario**: Credenciais de acesso (`email`, `senha`, `role`).
- **Cliente**: Dados de contato (`nome`, `telefone`, `cidade`).
- **Funcionario**: Equipe operacional (`nome`, `cpf`, `telefone`).
- **Brinquedo**: Inventário (`nome`, `quantidade_total`).
- **Evento**: Entidade central.
  - `data_inicio`, `data_fim`, `status`.
  - Relacionamento N:N com Brinquedos (via tabela `evento_brinquedos` com campo `quantidade`).
  - Relacionamento N:N com Funcionários (via tabela `evento_funcionarios`).

## 4. Endpoints da API (Backend NestJS)
Todos os endpoints (exceto auth) exigem Header `Authorization: Bearer <token>`.

- **Auth**: `POST /auth/login`, `POST /auth/register`
- **Eventos**:
  - `GET /eventos` (Filtros: page, limit, dataInicio, dataFim, status)
  - `POST /eventos` (Payload complexo com arrays de brinquedos e funcionários)
  - `PATCH /eventos/:id`
  - `DELETE /eventos/:id`
  - `PATCH /eventos/:id/cancelar`
- **Recursos (CRUD Padrão)**:
  - `/brinquedos`, `/funcionarios`, `/clientes` (GET, POST, PATCH, DELETE)

## 5. Fluxos de Dados
### Autenticação
1. Usuário envia credenciais.
2. Backend valida e retorna JWT contendo `sub` (userId) e `empresaId`.
3. Frontend armazena JWT (LocalStorage/Cookie).
4. Interceptador HTTP anexa o token em todas as requisições subsequentes.

### Criação de Evento (Complexo)
1. Frontend carrega listas de Clientes, Brinquedos e Funcionários.
2. Usuário preenche dados básicos e seleciona itens via Modais.
3. Frontend monta payload JSON:
   ```json
   {
     "titulo": "Festa X",
     "brinquedos": [{ "brinquedoId": 1, "quantidade": 2 }],
     "funcionarios": [5, 8]
   }
   ```
4. Backend recebe, valida datas (`fim > inicio`) e salva com Cascade (insere na tabela eventos e nas tabelas pivô automaticamente).

## 6. Arquitetura Frontend (React + Vite)
- **Framework**: Vite (React + TypeScript)
- **Gerenciamento de Estado/API**: TanStack Query (React Query) v5.
- **Formulários**: React Hook Form + Zod.
- **UI Components**: shadcn/ui + Tailwind CSS.
- **Ícones**: Lucide React.
- **Estrutura de Pastas**: Feature-based (`src/features/`).

### Estrutura de Pastas Proposta
```
src/
├── app/                  # Configuração de rotas e providers
│   ├── router.tsx
│   └── query-client.ts
├── components/           # Componentes visuais genéricos (shadcn)
│   ├── ui/               # Button, Input, Dialog, Table
│   ├── layout/           # Sidebar, Header, PageContainer
│   └── data-table/       # Tabela reutilizável com paginação
├── features/             # Módulos de negócio (Domínios)
│   ├── auth/
│   ├── eventos/
│   │   ├── api/          # Hooks do React Query
│   │   ├── components/   # EventoForm, EventoList, SelectionModal
│   │   ├── types/        # Schemas Zod e Types TS
│   │   └── routes.tsx    # Rotas internas do módulo
│   ├── brinquedos/
│   └── funcionarios/
├── hooks/                # Hooks globais (useDebounce, useAuth)
├── lib/                  # Configurações (axios, utils, cn)
└── services/             # Definições base da API
```
