from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
# from datetime import datetime # Removido
import uuid

class EletrocalhaBase(BaseModel):
    project_id: int
    nome: Optional[str] = Field(None, description="Nome da eletrocalha, ex: EL-H1") # Tornando nome opcional aqui também
    # tipo: str = Field(..., description="Tipo da eletrocalha, 'horizontal' ou 'vertical'") # Removido
    ponto_a_x: int = Field(..., description="Coordenada X do ponto inicial")
    ponto_a_y: int = Field(..., description="Coordenada Y do ponto inicial")
    ponto_b_x: int = Field(..., description="Coordenada X do ponto final")
    ponto_b_y: int = Field(..., description="Coordenada Y do ponto final")
    capacidade_maxima: Optional[int] = 100
    ocupacao_total: Optional[int] = 0

class EletrocalhaCreate(EletrocalhaBase):
    nome: Optional[str] = None # Tornando nome opcional na criação

class EletrocalhaUpdate(BaseModel):
    nome: Optional[str] = None
    # tipo: Optional[str] = None # Removido
    ponto_a_x: Optional[int] = None
    ponto_a_y: Optional[int] = None
    ponto_b_x: Optional[int] = None
    ponto_b_y: Optional[int] = None
    capacidade_maxima: Optional[int] = None
    ocupacao_total: Optional[int] = None

class EletrocalhaInDB(EletrocalhaBase):
    id: int
    # created_at: datetime # Removido

    class Config:
        from_attributes = True
