from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

servicios_db = [
    {"nombre": "consulta", "precio": 50},
    {"nombre": "baño", "precio": 60},
    {"nombre": "corte", "precio": 100}
]

mascotas_db = []

class MascotaRegistro(BaseModel):
    correo: str
    nombre_mascota: str
    tipo_servicio: str
    fecha: str

@router.get("/servicios")
def listar_servicios():
    return {
        "servicios": servicios_db
    }

@router.post("/agregar-servicio")
def agregar_servicio(nuevo: dict):
    servicios_db.append(nuevo)
    return {
        "mensaje": "¡Servicio guardado!"
    }

@router.post("/registrar-mascota")
def registrar_mascota(mascota: MascotaRegistro):
    mascotas_db.append({
        "correo": mascota.correo,
        "nombre_mascota": mascota.nombre_mascota,
        "tipo_servicio": mascota.tipo_servicio,
        "fecha": mascota.fecha
    })
    return {
        "mensaje": "Mascota registrada exitosamente",
        "datos": mascota.dict()
    }

@router.get("/mascotas/{correo}")
def listar_mascotas_usuario(correo: str):
    mascotas_usuario = [m for m in mascotas_db if m["correo"] == correo]
    return {
        "correo": correo,
        "mascotas": mascotas_usuario
    }

@router.get("/reporte/{correo}")
def reporte_usuario(correo: str):
    mascotas_usuario = [m for m in mascotas_db if m["correo"] == correo]
    if not mascotas_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado o sin mascotas registradas")
    
    servicios_registrados = {}
    total_gastado = 0
    
    for mascota in mascotas_usuario:
        servicio = mascota["tipo_servicio"]
        if servicio not in servicios_registrados:
            servicios_registrados[servicio] = 0
        servicios_registrados[servicio] += 1
        
        # Buscar precio en servicios_db
        precio = next((s["precio"] for s in servicios_db if s["nombre"] == servicio), 0)
        total_gastado += precio
    
    return {
        "correo": correo,
        "cantidad_servicios": len(mascotas_usuario),
        "servicios_registrados": servicios_registrados,
        "total_gastado": total_gastado
    }