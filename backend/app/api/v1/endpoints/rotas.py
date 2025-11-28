from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uuid

from app.services.pathfinding import find_best_route
from app.api.v1.dependencies import get_user_token
from app.db.supabase_client import supabase_client
from app.models.eletrocalha import EletrocalhaInDB

router = APIRouter()

class RouteRequest(BaseModel):
    source_rack_id: int
    destination_rack_id: int

class RouteEletrocalha(BaseModel):
    id: int
    project_id: int
    ponto_a_x: int
    ponto_a_y: int
    ponto_b_x: int
    ponto_b_y: int
    capacidade_maxima: Optional[int] = 100
    ocupacao_total: Optional[int] = 0

    class Config:
        from_attributes = True

class RouteResponse(BaseModel):
    rota: List[RouteEletrocalha]
    distancia_total_m: float

class ConfirmRouteRequest(BaseModel):
    project_id: int
    rack_origem_id: int
    rack_destino_id: int
    distancia_metros: float
    eletrocalhas_ids: List[int]
    caminho_json: List[Dict[str, Any]]
    nome: Optional[str] = None

@router.post("/find", response_model=RouteResponse, status_code=200)
def plan_route(project_id: int, request: RouteRequest, token: str = Depends(get_user_token)):
    """
    Calcula a rota mais curta entre dois racks em um projeto.
    """
    try:
        result = find_best_route(
            project_id=project_id,
            source_rack_id=request.source_rack_id,
            destination_rack_id=request.destination_rack_id,
            token=token
        )

        if "error" in result:
            if "não encontrado" in result["error"] or "Não foi encontrado um caminho" in result["error"]:
                raise HTTPException(status_code=404, detail=result["error"])
            if "não está conectado" in result["error"]:
                raise HTTPException(status_code=400, detail=result["error"])
            raise HTTPException(status_code=500, detail=result["error"])
        
        return RouteResponse(
            rota=result["rota"],
            distancia_total_m=result["distancia_total_m"]
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno ao calcular rota: {str(e)}")

@router.get("", response_model=List[Dict[str, Any]])
def get_project_routes(project_id: int, token: str = Depends(get_user_token)):
    """
    Lista todas as rotas de um projeto.
    """
    try:
        supabase_client.postgrest.auth(token)
        response = supabase_client.table("Rotas").select("*").eq("project_id", project_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar rotas do projeto: {str(e)}")

@router.post("/confirm", status_code=201)
def confirm_route(request: ConfirmRouteRequest, token: str = Depends(get_user_token)):
    """
    Salva uma rota confirmada no banco de dados e atualiza a ocupação das eletrocalhas.
    """
    try:
        supabase_client.postgrest.auth(token)
        
        # 1. Salvar a nova rota na tabela 'rotas'
        route_name = request.nome or f"Rota de {request.rack_origem_id} para {request.rack_destino_id}"
        
        new_route = {
            "id": str(uuid.uuid4()),
            "project_id": request.project_id,
            "nome": route_name,
            "rack_origem_id": request.rack_origem_id,
            "rack_destino_id": request.rack_destino_id,
            "distancia_metros": request.distancia_metros,
            "eletrocalhas_ids": request.eletrocalhas_ids,
            "caminho_json": request.caminho_json,
            "status": "Ativa"
        }
        
        insert_res = supabase_client.table("Rotas").insert(new_route).execute()
        
        if not insert_res.data:
            raise HTTPException(status_code=500, detail="Não foi possível salvar a rota.")

        # 2. Atualizar a ocupação de cada eletrocalha na rota
        for eletrocalha_id in request.eletrocalhas_ids:
            # Usando rpc para incrementar o valor de forma atômica
            supabase_client.rpc(
                'incrementar_ocupacao_eletrocalha',
                {'eletrocalha_id_param': eletrocalha_id, 'incremento': 1}
            ).execute()

        return {"message": "Rota confirmada e salva com sucesso."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao confirmar rota: {str(e)}")