# Docker (LAN) - Agenda Eventos

Este guia sobe **Postgres + Backend + Frontend** via Docker Compose para uso em **rede local (LAN)**.

## Pré-requisitos

- Docker Desktop instalado e rodando
- Portas liberadas no PC servidor: **5173** (Web), **3000** (API opcional), **5432** (Postgres opcional)

## Como funciona (resumo mental)

- `db`: Postgres com volume persistente (`db_data`)
- `backend`: Node/Express + Prisma
  - executa `prisma migrate deploy` ao iniciar
  - grava logs em `Backend/logs` (mapeado para `/app/logs`)
- `frontend`: build do Vite servido pelo Nginx
  - `/api/*` é proxy para `backend:3000/api/*`

## Subir pela primeira vez

No diretório raiz do projeto (onde está `docker-compose.yml`):

```bash
docker compose up -d --build
```

Ver logs:

```bash
docker compose logs -f --tail=200
```

## Acessar pela LAN

No PC servidor, descubra seu IP (ex: `192.168.0.10`).

- Acesse no outro PC:
  - `http://SEU_IP:5173`

## Parar e remover

Parar:

```bash
docker compose down
```

Parar e apagar o banco (cuidado):

```bash
docker compose down -v
```

## Ajustes rápidos

- `JWT_SECRET`: altere em `docker-compose.yml` (backend)
- Porta web: altere `5173:80` (frontend)
- Porta API (debug): o compose expõe `3000:3000`; você pode remover se não quiser expor API na LAN
