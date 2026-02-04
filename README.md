# SolarFlow Pro - Gestão Fotovoltaica

Sistema inteligente para gestão de fluxo de projetos fotovoltaicos, desde a vistoria técnica até a conclusão da obra.

## 🏗️ Estrutura do Projeto

O projeto está dividido em duas partes principais:

### 1. [Frontend (React + Vite)](./frontend)
Interface do usuário construída com React 19, Tailwind CSS e Recharts.
- **Localização:** `/frontend`
- **Pastas internas:** 
  - `paginas/`: Telas principais (Painel, Login, Configurações).
  - `componentes/`: Blocos reutilizáveis da interface.
  - `servicos/`: Integração com Supabase e APIs externas (Gemini AI).
  - `tipos/`: Definições de TypeScript.

### 2. [Backend (Supabase)](./backend)
Configurações de banco de dados e políticas de segurança.
- **Localização:** `/backend`

## 🚀 Como Iniciar

1. Entre na pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🛠️ Tecnologias
- **Frontend:** React, TypeScript, Tailwind CSS, Lucide/FontAwesome.
- **Backend:** Supabase (Auth, Postgres, Storage).
- **IA:** Google Gemini AI (Especificações técnicas automáticas).

---
Desenvolvido por **VTS Engenharia**
