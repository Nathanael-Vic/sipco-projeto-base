# Projeto S.I.P.C.O. (Sistema Inteligente para Planejamento de Cabeamento Óptico)

Este é o projeto base para o S.I.P.C.O. O backend e o frontend já estão configurados, conectados e prontos para o desenvolvimento de features.

## Stack Tecnológica
* **Frontend:** React (com Vite) + Konva.js
* **Backend:** Python (com FastAPI)
* **Banco de Dados:** Supabase (PostgreSQL)

## Como Rodar o Projeto

Você precisará de **2 terminais** rodando simultaneamente.

---

### 1. Backend (FastAPI)

1.  Navegue até a pasta `backend`:
    ```bash
    cd backend
    ```
2.  Crie e ative um ambiente virtual:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate 
    ```
3.  Crie um arquivo `.env` (use o `.env.example` como base) e adicione sua **Connection String (URI)** do Supabase.
4.  Instale as dependências:
    ```bash
    pip install -r requirements.txt
    ```
5.  Rode o servidor:
    ```bash
    uvicorn main:app --reload
    ```
*O backend estará rodando em `http://127.0.0.1:8000`*

---

### 2. Frontend (React)

1.  Em um **novo terminal**, navegue até a pasta `frontend`:
    ```bash
    cd frontend
    ```
2.  Crie um arquivo `.env.local` (use o `.env.local.example` como base) e adicione as chaves `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3.  Instale as dependências:
    ```bash
    npm install
    ```
4.  Rode o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
*O frontend estará rodando em `http://localhost:5173` (ou similar)*