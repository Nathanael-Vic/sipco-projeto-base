from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel

from app.db.supabase_client import supabase_client
from app.api.v1.dependencies import get_user_token

router = APIRouter()

class RackCreate(BaseModel):
    project_id: int
    nome: str
    coordenada_x: int
    coordenada_y: int
    altura_u: Optional[int] = 42 # Default Rack height
    capacidade_u: int
    ocupado_u: int
    is_cross_connect: bool = False

class RackInDB(BaseModel):
    id: int
    project_id: int
    nome: str
    coordenada_x: int
    coordenada_y: int
    altura_u: int
    capacidade_u: int
    ocupado_u: int
    is_cross_connect: bool
    
    class Config:
        from_attributes = True

class RotaInDB(BaseModel):
    id: int
    nome: str
    rack_origem_id: int
    rack_destino_id: int
    distancia_metros: float

@router.get("", response_model=List[RackInDB])
def get_racks(project_id: int = Query(..., alias="project_id"), token: str = Depends(get_user_token)):
    """
    Lista todos os racks de um projeto específico do usuário autenticado.
    """
    try:
        supabase_client.postgrest.auth(token)
        response = supabase_client.table("Racks").select("*").eq("project_id", project_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar racks: {str(e)}")

@router.post("", status_code=201)
def create_rack(rack: RackCreate, token: str = Depends(get_user_token)):
    """
    Cria um novo rack para um projeto do usuário autenticado.
    """
    try:
        supabase_client.postgrest.auth(token)
        existing_rack = supabase_client.table("Racks").select("id").eq("project_id", rack.project_id).eq("coordenada_x", rack.coordenada_x).eq("coordenada_y", rack.coordenada_y).maybe_single().execute()
        
        if existing_rack and existing_rack.data:
             raise HTTPException(status_code=400, detail="Já existe um rack nesta posição para este projeto.")

        supabase_client.table("Racks").insert(rack.model_dump()).execute()
        
        return {"message": "Rack criado com sucesso"}

    except Exception as e:
        if "Missing response" in str(e):
            return {"message": "Rack criado com sucesso, mas o objeto não pôde ser retornado."}
        
        raise HTTPException(status_code=500, detail=f"Erro ao criar rack: {str(e)}")

@router.delete("/{rack_id}", status_code=200)
def delete_rack(rack_id: int, token: str = Depends(get_user_token)):
    """
    Deleta um rack específico do usuário autenticado.
    """
    try:
        supabase_client.postgrest.auth(token)
        response = supabase_client.table("Racks").delete().eq("id", rack_id).execute()
        
        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Rack não encontrado ou você não tem permissão para deletá-lo.")

        return {"message": "Rack deletado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao deletar rack: {str(e)}")

@router.put("/{rack_id}", response_model=RackInDB)
def update_rack(rack_id: int, rack: RackCreate, token: str = Depends(get_user_token)):
    """
    Atualiza um rack existente.
    """
    try:
        supabase_client.postgrest.auth(token)
        update_data = rack.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="Nenhum dado para atualizar.")

        response = supabase_client.table("Racks").update(update_data).eq("id", rack_id).execute()
        
        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Rack não encontrado para atualização.")
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{rack_id}/rotas", response_model=List[RotaInDB])
def get_rack_routes(rack_id: int, token: str = Depends(get_user_token)):
    """
    Lista todas as rotas conectadas a um rack específico.
    """
    try:
        supabase_client.postgrest.auth(token)
        response = supabase_client.table("Rotas").select("id, nome, rack_origem_id, rack_destino_id, distancia_metros").or_(f"rack_origem_id.eq.{rack_id},rack_destino_id.eq.{rack_id}").execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar rotas do rack: {str(e)}")