# Projeto SIPCO (Sistema Inteligente para Planejamento de Cabeamento Óptico)

## Visão Geral

O SIPCO é um sistema desenvolvido para auxiliar no planejamento e mapeamento de infraestruturas de cabeamento óptico em data centers. Ele permite a visualização da planta do data hall, gerenciamento de racks e eletrocalhas, planejamento automático de rotas e sugestão de layouts.

## Arquitetura

O projeto segue uma arquitetura moderna e distribuída, composta por três camadas principais:

1.  **Frontend (Interface do Usuário):** Aplicação web interativa.
2.  **Backend (API de Serviços):** Responsável pela lógica de negócio e comunicação com o banco de dados.
3.  **Banco de Dados:** Armazenamento persistente dos dados do projeto.

## Tecnologias Utilizadas

*   **Frontend:**
    *   **React:** Biblioteca JavaScript para construção de interfaces de usuário.
    *   **Vite:** Ferramenta de build rápido para projetos web.
    *   **Konva.js:** Biblioteca JavaScript para desenho em Canvas 2D, utilizada para renderizar a planta do data hall.
*   **Backend:**
    *   **Python:** Linguagem de programação principal.
    *   **FastAPI:** Framework web moderno e de alta performance para construção de APIs.
*   **Banco de Dados:**
    *   **Supabase:** Plataforma de código aberto que oferece funcionalidades de Backend-as-a-Service, incluindo um banco de dados **PostgreSQL**.

## Estrutura de Pastas

A estrutura de pastas do projeto foi organizada para promover modularidade, escalabilidade e clareza, separando as preocupações por domínio:

```
.
├── backend/                  # Código fonte do servidor FastAPI
│   ├── app/                  # Aplicação principal do FastAPI
│   │   ├── api/              # Definição dos endpoints da API (versões, routers)
│   │   ├── core/             # Configurações globais e de ambiente
│   │   ├── db/               # Configuração da conexão com o banco de dados
│   │   ├── models/           # Modelos de dados (Pydantic)
│   │   ├── services/         # Lógica de negócio e algoritmos
│   │   └── main.py           # Ponto de entrada do FastAPI
│   ├── tests/                # Testes do backend
│   └── requirements.txt      # Dependências do Python
│
├── frontend/                 # Código fonte da aplicação React
│   ├── public/               # Arquivos estáticos
│   ├── src/                  # Código fonte principal do React
│   │   ├── api/              # Funções para comunicação com o backend e Supabase
│   │   ├── assets/           # Imagens, ícones, SVGs
│   │   ├── components/       # Componentes React reutilizáveis (common, canvas, etc.)
│   │   ├── contexts/         # Contextos React para estado global
│   │   ├── hooks/            # Hooks personalizados do React
│   │   ├── pages/            # Componentes de página
│   │   ├── styles/           # Estilos globais e CSS
│   │   └── App.jsx           # Componente raiz da aplicação (roteamento)
│   └── vite.config.js
│
└── database/                 # Scripts e definições relacionadas ao banco de dados
    ├── migrations/           # Scripts de migração de schema
    └── functions/            # Definições de funções PostgreSQL
```

## Como Iniciar

Para configurar e executar o projeto, siga os passos abaixo para o backend e o frontend.

### Pré-requisitos

*   **Python 3.8+**
*   **Node.js 18+** e **npm 8+**
*   Uma conta e projeto no **Supabase** (com o banco de dados PostgreSQL configurado).

### 1. Configuração do Supabase

Antes de iniciar o backend ou o frontend, você precisará configurar as variáveis de ambiente com as credenciais do seu projeto Supabase.

Crie um arquivo `.env` na raiz da pasta `backend/` e adicione as seguintes variáveis (substitua pelos seus dados do Supabase):

```
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE_NAME]"
SUPABASE_URL="https://[YOUR_SUPABASE_PROJECT_REF].supabase.co"
SUPABASE_KEY="[YOUR_SUPABASE_ANON_KEY]"
```

*   `DATABASE_URL`: Pode ser encontrado na seção de configurações do seu projeto Supabase, em "Database".
*   `SUPABASE_URL`: O URL da sua API do Supabase.
*   `SUPABASE_KEY`: Sua "anon key" ou "public key" do Supabase.

### 2. Executando o Backend (FastAPI)

1.  **Navegue até o diretório do backend:**
    ```bash
    cd backend
    ```
2.  **Crie e ative um ambiente virtual (opcional, mas recomendado):**
    ```bash
    python -m venv venv
    # No Windows
    .\venv\Scripts\activate
    # No macOS/Linux
    source venv/bin/activate
    ```
3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Execute a aplicação FastAPI:**
    ```bash
    uvicorn app.main:app --reload
    ```
    O backend estará disponível em `http://127.0.0.1:8000`.

### 3. Executando o Frontend (React com Vite)

1.  **Navegue até o diretório do frontend:**
    ```bash
    cd frontend
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    O frontend estará disponível em `http://localhost:5173` (ou outra porta disponível).

Certifique-se de que o backend esteja rodando antes de iniciar o frontend para que a comunicação entre eles funcione corretamente.