# SolarFlow Pro - Backend (Supabase)

Esta pasta contém a estrutura relacionada ao "Backend" da aplicação, que é gerenciado pelo **Supabase** (Backend-as-a-Service).

## Estrutura de Pastas

- `/supabase/migrations`: Scripts SQL para criação de tabelas e políticas de segurança (RLS).
- `/supabase/seed`: Dados iniciais para teste e desenvolvimento.

## Configurações
O frontend se conecta a este backend utilizando as credenciais configuradas no `.env.local` dentro da pasta `/frontend`.

### Tabelas Principais (Esquema Postgres)
- `projects`: Armazena dados dos clientes, potência do sistema e status do fluxo.
- `equipment`: Catálogo técnico de módulos e inversores.
- `notifications`: Sistema de alertas em tempo real.
- `surveys`: Dados detalhados das vistorias técnicas (JSONB).

---
*VTS Engenharia - 2026*
