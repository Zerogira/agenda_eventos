# Atualização de Backend: Suporte a Multi-tenancy (EmpresaID)

O frontend foi atualizado para enviar o `empresaId` ao criar ou atualizar registros, garantindo que os dados sejam segregados por empresa. 

**Alterações necessárias no Backend:**

## 1. Banco de Dados (Migração)

É necessário adicionar a coluna `empresaId` em todas as tabelas principais do sistema. Se estiver usando SQL, o comando seria similar a:

```sql
ALTER TABLE clientes ADD COLUMN "empresaId" VARCHAR(255);
ALTER TABLE funcionarios ADD COLUMN "empresaId" VARCHAR(255);
ALTER TABLE brinquedos ADD COLUMN "empresaId" VARCHAR(255);
ALTER TABLE eventos ADD COLUMN "empresaId" VARCHAR(255);

-- Opcional: Adicionar chave estrangeira se existir tabela de empresas
-- ALTER TABLE clientes ADD CONSTRAINT fk_clientes_empresas FOREIGN KEY ("empresaId") REFERENCES empresas(id);
```

## 2. API / Controllers

### Criação (POST) e Atualização (PUT)
Ao receber os dados no corpo da requisição (`req.body`), o backend deve:
1.  Verificar se o `empresaId` foi enviado.
2.  Salvar esse ID junto com o registro no banco de dados.

### Listagem (GET)
**Crítico:** Todas as rotas de listagem (`GET /clientes`, `GET /eventos`, etc.) devem filtrar os resultados pelo `empresaId` do usuário logado.

*   **Como obter o ID:** Geralmente extraído do token JWT no middleware de autenticação (`req.user.empresaId`).
*   **Query SQL (Exemplo):** `SELECT * FROM clientes WHERE "empresaId" = ?`

Se o filtro não for aplicado, um usuário poderá ver os dados de outra empresa, o que é uma falha grave de segurança.

## 3. Schemas de Validação (Zod/Joi)
Atualizar os schemas de entrada para permitir (e validar) o campo `empresaId`.

```typescript
// Exemplo Zod
const clienteSchema = z.object({
  nome: z.string(),
  // ... outros campos
  empresaId: z.string().optional() // ou .required() dependendo da lógica
});
```
