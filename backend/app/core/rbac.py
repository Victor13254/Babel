# app/core/rbac.py
from fastapi import Depends, HTTPException, status
from app.core.auth import get_current_user

# Permisos atómicos por rol
ROLE_PERMISSIONS: dict[str, set[str]] = {
    "user": {
        # courses (lectura pública)
        "courses:read", "modules:read", "lessons:read", "blocks:read",
        # exercises (resolver y ver propios)
        "exercises:read", "attempts:create", "attempts:read:self",
        # profiles (su propio perfil)
        "profile:read:self", "profile:update:self",
        # progress & gamification (propio)
        "progress:read:self", "progress:upsert:self",
        "xp:add:self", "streak:read:self",
        # community (participar)
        "threads:create", "threads:read", "posts:create", "posts:read",
        # media (solo lectura de catálogo)
        "media:read",
        # users
        "users:me",
    },
    "admin": {
        # todo lo de user
        *{
            "courses:read","modules:read","lessons:read","blocks:read",
            "exercises:read","attempts:create","attempts:read:self",
            "profile:read:self","profile:update:self",
            "progress:read:self","progress:upsert:self","xp:add:self","streak:read:self",
            "threads:create","threads:read","posts:create","posts:read",
            "media:read",
            "users:me",
        },
        # gestión de contenido (courses)
        "courses:create","courses:update","courses:delete",
        "modules:create","modules:update","modules:delete",
        "lessons:create","lessons:update","lessons:delete",
        "blocks:create","blocks:update","blocks:delete",
        # exercises CRUD
        "exercises:create","exercises:update","exercises:delete",
        # comunidad (moderación)
        "threads:pin",
        # gamificación
        "badges:create",
        # feedback (admin actúa como profesor)
        "feedback:create","feedback:read",
        # media (registro/altas)
        "media:create",
        # users (rutas administrativas si las agregas)
        "users:admin",
    }
}

def requires(*required_permissions: str):
    """
    Uso: dependencies=[Depends(requires("courses:create"))]
    Valida que el rol del usuario contenga TODOS los permisos requeridos.
    """
    def dependency(current_user = Depends(get_current_user)):
        perms = ROLE_PERMISSIONS.get(current_user.role, set())
        missing = [p for p in required_permissions if p not in perms]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not enough permissions: missing {missing}"
            )
        return current_user
    return dependency
