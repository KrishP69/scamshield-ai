from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    store_history: bool = Field(default=False)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    role: str
    store_history: bool
    created_at: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
