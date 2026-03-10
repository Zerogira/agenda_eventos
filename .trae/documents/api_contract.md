# Especificação de API e Contrato de Backend

Este documento descreve a especificação completa para o desenvolvimento do backend da aplicação "Agenda de Eventos". O backend deve ser desenvolvido utilizando **Node.js, Express, Prisma ORM e PostgreSQL**.

## 1. Visão Geral

*   **Base URL**: `/api` (recomendado) ou `/`
*   **Autenticação**: Bearer Token (JWT) em todos os endpoints protegidos.
*   **Multi-tenancy**: Todas as tabelas principais devem possuir `empresa_id` para isolamento lógico de dados.
*   **Formato de Data**: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`).

## 2. Modelo de Banco de Dados (Prisma Schema)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Empresa {
  id        String   @id @default(uuid())
  nome      String
  cnpj      String?
  usuarios  Usuario[]
  clientes  Cliente[]
  funcionarios Funcionario[]
  brinquedos Brinquedo[]
  eventos   Evento[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("empresas")
}

model Usuario {
  id        String   @id @default(uuid())
  empresaId String
  empresa   Empresa  @relation(fields: [empresaId], references: [id], onDelete: Cascade)
  nome      String
  email     String   @unique
  senha     String   // Hash
  role      String   @default("ADMIN") // ADMIN, USER
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("usuarios")
}

model Cliente {
  id        Int      @id @default(autoincrement())
  empresaId String
  empresa   Empresa  @relation(fields: [empresaId], references: [id], onDelete: Cascade)
  nome      String
  telefone  String
  cidade    String
  eventos   Evento[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("clientes")
}

model Funcionario {
  id        Int      @id @default(autoincrement())
  empresaId String
  empresa   Empresa  @relation(fields: [empresaId], references: [id], onDelete: Cascade)
  nome      String
  cpf       String
  telefone  String
  ativo     Boolean  @default(true)
  eventos   EventoFuncionario[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("funcionarios")
}

model Brinquedo {
  id                   Int      @id @default(autoincrement())
  empresaId            String
  empresa              Empresa  @relation(fields: [empresaId], references: [id], onDelete: Cascade)
  nome                 String
  descricao            String?
  marca                String?
  quantidade_total     Int      @default(0)
  necessita_funcionario Boolean @default(false)
  ativo                Boolean  @default(true)
  eventos              EventoBrinquedo[]
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@map("brinquedos")
}

enum StatusEvento {
  AGENDADO
  CONFIRMADO
  FINALIZADO
  CANCELADO
}

model Evento {
  id           String   @id @default(uuid())
  empresaId    String
  empresa      Empresa  @relation(fields: [empresaId], references: [id], onDelete: Cascade)
  clienteId    Int
  cliente      Cliente  @relation(fields: [clienteId], references: [id])
  titulo       String
  descricao    String?
  dataInicio   DateTime
  dataFim      DateTime
  status       StatusEvento @default(AGENDADO)
  valorTotal   Decimal?  @db.Decimal(10, 2)
  
  brinquedos   EventoBrinquedo[]
  funcionarios EventoFuncionario[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("eventos")
}

model EventoBrinquedo {
  eventoId    String
  evento      Evento    @relation(fields: [eventoId], references: [id], onDelete: Cascade)
  brinquedoId Int
  brinquedo   Brinquedo @relation(fields: [brinquedoId], references: [id])
  quantidade  Int

  @@id([eventoId, brinquedoId])
  @@map("evento_brinquedos")
}

model EventoFuncionario {
  eventoId      String
  evento        Evento      @relation(fields: [eventoId], references: [id], onDelete: Cascade)
  funcionarioId Int
  funcionario   Funcionario @relation(fields: [funcionarioId], references: [id])

  @@id([eventoId, funcionarioId])
  @@map("evento_funcionarios")
}
```

## 3. Endpoints da API

### 3.1. Autenticação

#### Login
*   **POST** `/auth/login`
*   **Body**:
    ```json
    {
      "email": "admin@empresa.com",
      "password": "senha_segura"
    }
    ```
*   **Response (200)**:
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1Ni...",
      "user": {
        "id": "uuid-user",
        "email": "admin@empresa.com",
        "role": "ADMIN",
        "empresaId": "uuid-empresa"
      }
    }
    ```

### 3.2. Clientes

#### Listar Clientes
*   **GET** `/clientes`
*   **Query Params**: `page` (opcional), `limit` (opcional), `search` (opcional - nome ou cidade).
*   **Response (200)**:
    ```json
    [
      {
        "id": 1,
        "nome": "João Silva",
        "telefone": "11999999999",
        "cidade": "São Paulo"
      }
    ]
    ```

#### Criar Cliente
*   **POST** `/clientes`
*   **Body**:
    ```json
    {
      "nome": "Maria Oliveira",
      "telefone": "11988888888",
      "cidade": "Rio de Janeiro"
    }
    ```
*   **Response (201)**: Objeto criado.

### 3.3. Funcionários

#### Listar Funcionários
*   **GET** `/funcionarios`
*   **Response (200)**:
    ```json
    [
      {
        "id": 1,
        "nome": "Carlos Souza",
        "cpf": "123.456.789-00",
        "telefone": "11977777777",
        "ativo": true
      }
    ]
    ```

#### Criar Funcionário
*   **POST** `/funcionarios`
*   **Body**:
    ```json
    {
      "nome": "Ana Costa",
      "cpf": "987.654.321-00",
      "telefone": "11966666666",
      "ativo": true
    }
    ```

### 3.4. Brinquedos

#### Listar Brinquedos
*   **GET** `/brinquedos`
*   **Response (200)**:
    ```json
    [
      {
        "id": 1,
        "nome": "Cama Elástica",
        "descricao": "4 metros de diâmetro",
        "marca": "BestJump",
        "quantidade_total": 2,
        "necessita_funcionario": true,
        "ativo": true
      }
    ]
    ```

#### Criar Brinquedo
*   **POST** `/brinquedos`
*   **Body**:
    ```json
    {
      "nome": "Castelo Inflável",
      "descricao": "Castelo grande com escorregador",
      "marca": "Inflatoy",
      "quantidade_total": 1,
      "necessita_funcionario": true,
      "ativo": true
    }
    ```

### 3.5. Eventos (Core)

#### Listar Eventos
*   **GET** `/eventos`
*   **Query Params**: `start` (data ISO), `end` (data ISO) - Essencial para o FullCalendar.
*   **Response (200)**:
    ```json
    [
      {
        "id": "uuid-evento",
        "titulo": "Aniversário Alice",
        "start": "2023-10-25T14:00:00Z", // Mapeado de dataInicio
        "end": "2023-10-25T18:00:00Z",   // Mapeado de dataFim
        "status": "AGENDADO",
        "cliente": { "nome": "João Silva" }
      }
    ]
    ```

#### Criar Evento
*   **POST** `/eventos`
*   **Body**:
    ```json
    {
      "titulo": "Festa Junina",
      "clienteId": 1,
      "dataInicio": "2023-06-24T18:00:00Z",
      "dataFim": "2023-06-24T23:00:00Z",
      "brinquedos": [
        { "brinquedoId": 1, "quantidade": 1 },
        { "brinquedoId": 2, "quantidade": 1 }
      ],
      "funcionarios": [1, 3] // Array de IDs de funcionários
    }
    ```
*   **Validações Backend**:
    *   `dataFim` deve ser maior que `dataInicio`.
    *   Verificar disponibilidade de estoque dos brinquedos para o período (Opcional/Avançado: `quantidade_total` vs `eventos` confirmados no horário).

#### Detalhes do Evento
*   **GET** `/eventos/:id`
*   **Response (200)**: Objeto evento completo, incluindo relacionamentos (`brinquedos` e `funcionarios`).

#### Atualizar Status
*   **PATCH** `/eventos/:id/status`
*   **Body**: `{ "status": "CONFIRMADO" }`

#### Cancelar Evento
*   **DELETE** `/eventos/:id` ou **PATCH** `/eventos/:id/cancelar`

## 4. Tratamento de Erros

A API deve retornar erros no seguinte formato padrão:

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "errors": [
    "Data de fim deve ser maior que data de início",
    "Brinquedo ID 5 não encontrado"
  ]
}
```

*   **400 Bad Request**: Erros de validação (Zod/Yup no backend).
*   **401 Unauthorized**: Token ausente ou inválido.
*   **403 Forbidden**: Usuário sem permissão para acessar o recurso.
*   **404 Not Found**: Recurso não encontrado.
*   **500 Internal Server Error**: Erro não tratado.
