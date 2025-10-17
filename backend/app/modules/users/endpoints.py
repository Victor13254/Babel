from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi.security import OAuth2PasswordRequestForm
from app.core.rate_limit import rate_limit

from app.core.security import create_access_token
from app.core.deps import get_db
from app.modules.users.schemas import RegisterFull, UserOut
from app.modules.users.crud import crud_user
from app.modules.auth.schemas import Token
from app.core.rbac import requires
from app.core.auth import get_current_user, require_admin
router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=UserOut, status_code=201)
def register_user(payload: RegisterFull, db: Session = Depends(get_db)):
    existing = crud_user.get_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=409, detail="El email ya está registrado.")

    try:
        user = crud_user.create_with_profile(db, payload)
    except IntegrityError:
        raise HTTPException(status_code=409, detail="El email ya está registrado.")
    return user

@router.post("/login", response_model=Token,dependencies=[Depends(rate_limit)])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    email = (form_data.username or "").strip().lower()
    user = crud_user.authenticate(db, email, form_data.password)
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Incorrect email or password"
        )
    token = create_access_token(subject=user.email)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", status_code = 200,response_model=UserOut, dependencies=[Depends(requires("users:me"))])
def read_me(current_user=Depends(get_current_user)):
    return current_user

@router.get("/admin-test", dependencies=[Depends(requires("users:admin"))])
def admin_only(_=Depends(require_admin)):
    return {"ok": True, "msg": "Solo admin"}
