import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from app.core.security import create_access_token, create_refresh_token, decode_token, get_password_hash, verify_password
from app.schemas.user import Token, UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory user store for demo/development
_users_db = {}


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate) -> UserResponse:
    if payload.email in _users_db:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user_record = {
        "id": user_id,
        "email": payload.email,
        "password_hash": get_password_hash(payload.password),
        "role": "user",
        "store_history": payload.store_history,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    _users_db[payload.email] = user_record

    return UserResponse(
        id=user_id,
        email=payload.email,
        role="user",
        store_history=payload.store_history,
        created_at=user_record["created_at"],
    )


@router.post("/login", response_model=Token)
async def login(payload: UserLogin) -> Token:
    user = _users_db.get(payload.email)
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(user["id"])
    refresh_token = create_refresh_token(user["id"])
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token)
async def refresh_token(token_data: Token) -> Token:
    payload = decode_token(token_data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = payload.get("sub")
    access_token = create_access_token(user_id)
    new_refresh = create_refresh_token(user_id)
    return Token(access_token=access_token, refresh_token=new_refresh)


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout() -> dict:
    return {"message": "Logged out successfully"}
