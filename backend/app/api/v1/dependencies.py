from typing import Optional
from fastapi import Header, HTTPException

async def get_user_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Cabeçalho de autorização ausente")
    
    # O cabeçalho vem como "Bearer <token>"
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Formato de autorização inválido")
    
    return parts[1] # Retorna apenas o token
