from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from app.core.rate_limit import rate_limit

from app.core.config import settings
from app.core.security import create_access_token
from app.core.deps import get_db
from app.modules.users.schemas import UserCreate, UserOut
from app.modules.users.crud import crud_user
from app.modules.auth.schemas import Token

router = APIRouter(prefix="/users", tags=["users"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/users/login")

def get_current_user(
        db: Session = Depends(get_db),
        token: str = Depends(oauth2_scheme),
):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        email: str | None = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=401,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = crud_user.get_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/register", response_model=UserOut, status_code = 201)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = crud_user.get_by_email(db, payload.email)
    if existing:
        raise HTTPException(
            status_code= 409,
            detail="El email ya está registrado."
        )
    try:
        user = crud_user.create(db, payload)
    except IntegrityError:

        raise HTTPException(
            status_code= 409,
            detail="El email ya está registrado.",
        )
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

@router.get("/me", status_code = 200,response_model=UserOut)
def read_me(current_user=Depends(get_current_user)):
    return current_user
