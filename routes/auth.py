from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class UserCredentials(BaseModel):
    correo: str
    contraseña: str

# Lista temporal para simular base de datos
users_db = []

@router.post("/register")
def register(user: UserCredentials):
    users_db.append({"correo": user.correo, "contraseña": user.contraseña})
    return {
        "mensaje": "Usuario registrado exitosamente",
        "datos": {"correo": user.correo, "contraseña": user.contraseña}
    }

@router.post("/login")
def login(user: UserCredentials):
    # Simular verificación (en una implementación real, verificar hash de contraseña)
    for u in users_db:
        if u["correo"] == user.correo and u["contraseña"] == user.contraseña:
            return {
                "mensaje": "Login exitoso",
                "datos": {"correo": user.correo, "contraseña": user.contraseña}
            }
    return {
        "mensaje": "Credenciales incorrectas",
        "datos": {"correo": user.correo, "contraseña": user.contraseña}
    }