"""SteelCraft - Endpoints de Autenticación (Registro, Login, Perfil y Avatar)."""

from typing import Annotated
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import User, UserRole
from app.schemas import Token, UserCreate, UserResponse, UserUpdate
from app.security import create_access_token, get_password_hash, verify_password, get_current_active_user
from app.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register_user(request: Request, user_in: UserCreate, db: Annotated[Session, Depends(get_db)]):
    """Registra un nuevo usuario en la plataforma."""
    email_clean = user_in.email.strip().lower()
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )

    username_clean = None
    if user_in.username:
        username_clean = user_in.username.strip()
        existing_username = db.query(User).filter(func.lower(User.username) == username_clean.lower()).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The username is already taken.",
            )

    db_user = User(
        email=email_clean,
        username=username_clean,
        password_hash=get_password_hash(user_in.password),
        role=UserRole.USER,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
):
    """Inicia sesión y genera un token JWT de acceso."""
    email_input = form_data.username.strip().lower()

    if "@" not in email_input:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    user = db.query(User).filter(User.email == email_input).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )

    access_token = create_access_token(subject=str(user.id))
    return Token(access_token=access_token, role=user.role.value)


@router.post("/logout")
def logout(current_user: Annotated[User, Depends(get_current_active_user)]):
    """Cierra la sesión del usuario actual."""
    return {"message": "Successfully logged out"}

@router.get("/users/me", response_model=UserResponse)
def get_user_me(current_user: Annotated[User, Depends(get_current_active_user)]):
    """Obtiene la información del perfil del usuario actual autenticado."""
    return current_user

@router.patch("/users/me", response_model=UserResponse)
@limiter.limit("20/minute")
def update_user_profile(
    request: Request,
    user_in: UserUpdate, 
    current_user: Annotated[User, Depends(get_current_active_user)], 
    db: Annotated[Session, Depends(get_db)]
):
    """Edita la información del perfil del usuario actual."""
    if user_in.username is not None:
        username_clean = user_in.username.strip()
        existing = db.query(User).filter(func.lower(User.username) == username_clean.lower(), User.id != current_user.id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The username is already taken.",
            )
        current_user.username = username_clean

    if user_in.birth_date is not None:
        current_user.birth_date = user_in.birth_date

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/users/me/avatar", response_model=UserResponse)
@limiter.limit("10/minute")
async def upload_user_avatar(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Sube y actualiza el avatar de perfil del usuario."""
    try:
        allowed_types = ["image/jpeg", "image/png", "image/jpg"]
        if not file.content_type or file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato no válido. Solo se permiten imágenes PNG o JPG.",
            )

        BASE_DIR = Path(__file__).resolve().parent.parent.parent
        upload_dir = BASE_DIR / "uploads" / "avatars"
        os.makedirs(upload_dir, exist_ok=True)

        file_extension = "jpg"
        if file.filename and "." in file.filename:
            ext = file.filename.split(".")[-1].lower()
            if ext in ["png", "jpg", "jpeg"]:
                file_extension = ext

        file_name = f"{current_user.id}_{uuid.uuid4()}.{file_extension}"
        file_path_full = upload_dir / file_name

        contents = await file.read()
        with open(file_path_full, "wb") as f:
            f.write(contents)

        relative_db_path = f"uploads/avatars/{file_name}"
        current_user.avatar_key = relative_db_path
        
        db.commit()
        db.refresh(current_user)

        return current_user

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno al procesar la imagen: {str(e)}"
        )