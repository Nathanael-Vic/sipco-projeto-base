from typing import List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.db.supabase_client import supabase_client
from app.api.v1.dependencies import get_user_token

router = APIRouter()

class ProjetoCreate(BaseModel):
    nome: str
    largura: int # Em blocos de 600mm
    altura: int  # Em blocos de 600mm

class ProjetoInDB(BaseModel):
    id: int
    nome: str
    largura_mm: int
    altura_mm: int
    created_at: str
    user_id: str # Adicionado user_id

    class Config:
        from_attributes = True

@router.post("", response_model=ProjetoInDB, status_code=201)
def create_project(proj: ProjetoCreate, token: str = Depends(get_user_token)):
    """
    Cria um novo projeto no banco de dados, associando-o ao usuário autenticado.
    """
    try:
        supabase_client.postgrest.auth(token)
        user = supabase_client.auth.get_user(token) # Obtém informações do usuário
        if not user or not user.user.id:
            raise HTTPException(status_code=401, detail="Usuário não autenticado ou ID de usuário inválido.")
        
        # Converte as dimensões de blocos para mm
        largura_mm = proj.largura * 600
        altura_mm = proj.altura * 600

        response = supabase_client.table("Projetos").insert({
            "nome": proj.nome,
            "largura_mm": largura_mm,
            "altura_mm": altura_mm,
            "user_id": user.user.id # Associa o projeto ao ID do usuário
        }).execute()

        if len(response.data) == 0:
            raise HTTPException(status_code=400, detail="Não foi possível criar o projeto.")
        
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar projeto: {str(e)}")

@router.get("", response_model=List[ProjetoInDB])
def get_projects(token: str = Depends(get_user_token)):
    """
    Lista todos os projetos do usuário autenticado.
    """
    try:
        supabase_client.postgrest.auth(token)
        user = supabase_client.auth.get_user(token)
        if not user or not user.user.id:
            raise HTTPException(status_code=401, detail="Usuário não autenticado ou ID de usuário inválido.")
        
        response = supabase_client.table("Projetos").select("*").eq("user_id", user.user.id).order("id", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar projetos: {str(e)}")

@router.delete("/{project_id}", status_code=200)
def delete_project(project_id: int, token: str = Depends(get_user_token)):
    """
    Deleta um projeto específico do usuário autenticado.
    """
    try:
        supabase_client.postgrest.auth(token)
        response = supabase_client.table("Projetos").delete().eq("id", project_id).execute()
        
        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Projeto não encontrado ou você não tem permissão para deletá-lo.")

        return {"message": "Projeto deletado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao deletar projeto: {str(e)}")
