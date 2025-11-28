from __future__ import annotations
import logging # Importar logging
from fastapi import APIRouter, Depends, HTTPException # Importar HTTPException
from pydantic import BaseModel, ValidationError # Importar ValidationError
from typing import List, Dict, Union, Optional # Adicionei Optional aqui

from app.services.layout_generator import gerar_layout_eletrocalhas_grid
from app.api.v1.dependencies import get_user_token # Import the dependency

router = APIRouter()

class LayoutGridRequest(BaseModel):
    largura_mm: int
    altura_mm: int
    capacidade_maxima_default: Optional[int] = 100

class Ponto(BaseModel):
    x: int
    y: int

class EletrocalhaSugerida(BaseModel):
    # tipo: str # Removido
    ponto_a_x: int
    ponto_a_y: int
    ponto_b_x: int
    ponto_b_y: int
    capacidade_maxima: Optional[int] = 100 # Adicionado aqui para o modelo de resposta

@router.post("/layout-grid", response_model=List[EletrocalhaSugerida])
def sugerir_layout_grid(request: LayoutGridRequest, token: str = Depends(get_user_token)):
    """
    Recebe as dimensões da planta e sugere um layout de eletrocalhas em formato de grid.
    """
    try:
        sugestoes = gerar_layout_eletrocalhas_grid(
            largura_mm=request.largura_mm,
            altura_mm=request.altura_mm,
            capacidade_maxima_default=request.capacidade_maxima_default # Passando a capacidade padrão
        )
        return sugestoes
    except ValidationError as e:
        import logging
        logging.error(f"Validation Error in sugerir_layout_grid: {e.errors()}")
        print(f"DETALHES DO ERRO DE VALIDAÇÃO: {e.errors()}") # Adicionado para garantir visibilidade no console
        raise HTTPException(status_code=422, detail=e.errors())
    except Exception as e:
        import logging
        logging.error(f"Erro inesperado em sugerir_layout_grid: {str(e)}", exc_info=True)
        print(f"ERRO INESPERADO DO SERVIDOR: {str(e)}") # Adicionado para garantir visibilidade
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")
