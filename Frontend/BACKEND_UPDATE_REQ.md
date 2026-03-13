# Requisito de Atualização do Backend

## Nova Rota: Concluir Evento

**Objetivo**: Permitir alterar o status de um evento para "CONCLUIDO" sem precisar enviar todos os dados do formulário novamente. Isso resolve o erro 400 (Bad Request) que ocorre ao tentar usar a rota de edição completa (`PUT`) enviando apenas o status.

### Especificação da Rota

- **Método**: `PATCH`
- **URL**: `/eventos/:id/concluir`
- **Autenticação**: Requer Token Bearer (Usuário logado)

### Comportamento Esperado

1.  **Buscar Evento**: Localizar o evento pelo `id` fornecido na URL.
2.  **Validar Permissão**: Garantir que o evento pertence à `empresaId` do usuário logado.
3.  **Atualizar Status**: Definir o campo `status` no banco de dados para o valor `'CONCLUIDO'`.
4.  **Resposta Sucesso (200)**:
    ```json
    {
      "id": "uuid",
      "status": "CONCLUIDO",
      "mensagem": "Evento concluído com sucesso"
    }
    ```
5.  **Resposta Erro (404)**: Evento não encontrado.
6.  **Resposta Erro (403)**: Sem permissão.

---

### Exemplo de Implementação (Node.js / Express / TypeORM ou Sequelize)

```javascript
// Exemplo genérico
router.patch('/eventos/:id/concluir', authMiddleware, async (req, res) => {
  try {
      const { id } = req.params;
      const empresaId = req.user.empresaId; // Do token JWT

      // 1. Busca segura por empresa
      const evento = await eventoRepository.findOne({ 
          where: { id, empresaId } 
      });

      if (!evento) {
        return res.status(404).json({ error: 'Evento não encontrado' });
      }

      // 2. Atualiza apenas o status
      evento.status = 'CONCLUIDO';
      await eventoRepository.save(evento);

      return res.json(evento);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao concluir evento' });
  }
});
```
