from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

class RackCreate(BaseModel):
    project_id: int
    nome: str
    coordenada_x: int
    coordenada_y: int
    capacidade_u: int
    ocupado_u: int
    temperatura_c: float
    potencia_kw: float

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProjetoCreate(BaseModel):
    nome: str
    largura: int
    altura: int

@app.get("/api/v1/")
def read_root():
    return {"status": "ok"}

@app.get("/api/v1/projects")
def get_projects():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM \"Projetos\" ORDER BY id DESC"))
        return {"projects": [row._asdict() for row in result]}

@app.post("/api/v1/projects")
def create_project(proj: ProjetoCreate):
    with engine.connect() as conn:
        result = conn.execute(
            text("INSERT INTO \"Projetos\" (nome, largura_mm, altura_mm) VALUES (:n, :l, :a) RETURNING id"),
            {"n": proj.nome, "l": proj.largura, "a": proj.altura}
        )
        conn.commit()
        new_id = result.fetchone()[0]
        return {"id": new_id, "message": "Projeto criado"}

@app.get("/api/v1/racks")
def get_racks(project_id: int):
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT * FROM \"Racks\" WHERE project_id = :pid"),
            {"pid": project_id}
        )
        return {"racks": [row._asdict() for row in result]}

@app.post("/api/v1/racks")
def create_rack(rack: RackCreate):
    with engine.connect() as conn:
        existing = conn.execute(
            text("SELECT id FROM \"Racks\" WHERE project_id = :pid AND coordenada_x = :x AND coordenada_y = :y"),
            {"pid": rack.project_id, "x": rack.coordenada_x, "y": rack.coordenada_y}
        ).fetchone()
        
        if existing:
             raise HTTPException(status_code=400, detail="Já existe um rack nesta posição.")

        result = conn.execute(
            text("""
                INSERT INTO "Racks" 
                (project_id, nome, coordenada_x, coordenada_y, capacidade_u, ocupado_u, temperatura_c, potencia_kw) 
                VALUES (:pid, :nome, :x, :y, :cap, :ocp, :temp, :pot) 
                RETURNING id
            """),
            {
                "pid": rack.project_id, "nome": rack.nome, 
                "x": rack.coordenada_x, "y": rack.coordenada_y,
                "cap": rack.capacidade_u, "ocp": rack.ocupado_u,
                "temp": rack.temperatura_c, "pot": rack.potencia_kw
            }
        )
        conn.commit()
        new_id = result.fetchone()[0]
        return {"id": new_id, "message": "Rack criado com sucesso"}

@app.get("/api/v1/eletrocalhas")
def get_eletrocalhas(project_id: int):
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT * FROM \"Eletrocalhas\" WHERE project_id = :pid"),
            {"pid": project_id}
        )
        return {"eletrocalhas": [row._asdict() for row in result]}
    
@app.delete("/api/v1/projects/{project_id}")
def delete_project(project_id: int):
    with engine.connect() as conn:
        result = conn.execute(
            text("DELETE FROM \"Projetos\" WHERE id = :pid"),
            {"pid": project_id}
        )
        conn.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Projeto não encontrado")
        return {"message": "Projeto deletado com sucesso"}