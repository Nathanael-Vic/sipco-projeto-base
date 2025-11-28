from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Importa os novos routers
from app.api.v1.endpoints import eletrocalhas as eletrocalhas_router
from app.api.v1.endpoints import sugestoes as sugestoes_router
from app.api.v1.endpoints import rotas as rotas_router
from app.api.v1.endpoints import projetos as projetos_router
from app.api.v1.endpoints import racks as racks_router # Import the new racks router

load_dotenv()

app = FastAPI(
    title="SIPCO API",
    description="Sistema Inteligente para Planejamento de Cabeamento Óptico",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui o router de eletrocalhas
app.include_router(
    eletrocalhas_router.router,
    prefix="/api/v1/eletrocalhas",
    tags=["Eletrocalhas"]
)

# Inclui o novo router de sugestões
app.include_router(
    sugestoes_router.router,
    prefix="/api/v1/sugestoes",
    tags=["Sugestões"]
)

# Inclui o novo router de rotas
app.include_router(
    rotas_router.router,
    prefix="/api/v1/rotas",
    tags=["Rotas"]
)

# Inclui o novo router de projetos
app.include_router(
    projetos_router.router,
    prefix="/api/v1/projects",
    tags=["Projetos"]
)

# Inclui o novo router de racks
app.include_router(
    racks_router.router,
    prefix="/api/v1/racks",
    tags=["Racks"]
)


@app.get("/api/v1/")
def read_root():
    return {"status": "ok"}