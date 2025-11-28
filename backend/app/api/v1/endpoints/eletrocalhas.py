from typing import List
from fastapi import APIRouter, HTTPException, Query, Depends
import uuid # Importar uuid

from app.db.supabase_client import supabase_client
from app.models.eletrocalha import EletrocalhaCreate, EletrocalhaInDB, EletrocalhaUpdate
from app.api.v1.dependencies import get_user_token

router = APIRouter()

@router.post("", response_model=EletrocalhaInDB, status_code=201) # Adicionado response_model
def criar_eletrocalha(eletrocalha: EletrocalhaCreate, token: str = Depends(get_user_token)):
    """
    Cria uma nova eletrocalha para um projeto.
    """
    try:
        supabase_client.postgrest.auth(token)
        # Inserir e retornar o objeto criado
        response = supabase_client.table("Eletrocalhas").insert(eletrocalha.model_dump()).execute() # Tabela em minúsculas
        if response.data:
            return response.data[0] # Retorna o primeiro (e único) objeto criado
        raise HTTPException(status_code=500, detail="Erro ao criar eletrocalha: nenhum dado retornado.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[EletrocalhaInDB])
def listar_eletrocalhas_por_projeto(project_id: int = Query(..., description="ID do projeto para filtrar as eletrocalhas"), token: str = Depends(get_user_token)):
    """
    Lista todas as eletrocalhas de um projeto específico.
    """
    try:
        supabase_client.postgrest.auth(token)
        response = supabase_client.table("Eletrocalhas").select("*").eq("project_id", str(project_id)).execute() # Tabela em minúsculas, project_id como str para a query
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{eletrocalha_id}", response_model=EletrocalhaInDB)
def obter_eletrocalha(eletrocalha_id: int, token: str = Depends(get_user_token)):
    """
    Obtém uma eletrocalha específica pelo seu ID.
    """
    try:
        supabase_client.postgrest.auth(token)
        response = supabase_client.table("Eletrocalhas").select("*").eq("id", str(eletrocalha_id)).single().execute() # Tabela em minúsculas, eletrocalha_id como str
        if not response.data:
            raise HTTPException(status_code=404, detail="Eletrocalha não encontrada.")
        return response.data
    except Exception as e:
        if "PGRST116" in str(e): # Erro específico do PostgREST para "não encontrado"
             raise HTTPException(status_code=404, detail="Eletrocalha não encontrada.")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{eletrocalha_id}", response_model=EletrocalhaInDB)
def atualizar_eletrocalha(eletrocalha_id: int, eletrocalha: EletrocalhaUpdate, token: str = Depends(get_user_token)):
    """
    Atualiza uma eletrocalha.
    """
    try:
        supabase_client.postgrest.auth(token)
        update_data = eletrocalha.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="Nenhum dado para atualizar.")

        response = supabase_client.table("Eletrocalhas").update(update_data).eq("id", str(eletrocalha_id)).execute() # Tabela em minúsculas, eletrocalha_id como str
        
        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Eletrocalha não encontrada para atualização.")
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{eletrocalha_id}", status_code=200)
def deletar_eletrocalha(eletrocalha_id: int, token: str = Depends(get_user_token)):
    """
    Deleta uma eletrocalha.
    """
    try:
        supabase_client.postgrest.auth(token)
        response = supabase_client.table("Eletrocalhas").delete().eq("id", str(eletrocalha_id)).execute() # Tabela em minúsculas, eletrocalha_id como str
        
        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Eletrocalha não encontrada para deleção.")

        return {"message": "Eletrocalha deletada com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
