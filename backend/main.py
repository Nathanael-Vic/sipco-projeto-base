from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/")
def read_root():
    return {"Hello": "World", "Project": "S.I.P.C.O."}

@app.get("/api/v1/racks")
def get_racks():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT * FROM Racks"))
            racks = [row._asdict() for row in result]
            return {"racks": racks}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/v1/eletrocalhas")
def get_eletrocalhas():
    try:
        with engine.connect() as connection:
            # Faz um SELECT na nova tabela
            result = connection.execute(text("SELECT * FROM Eletrocalhas"))
            calhas = [row._asdict() for row in result]
            return {"eletrocalhas": calhas}
    except Exception as e:
        return {"error": str(e)}