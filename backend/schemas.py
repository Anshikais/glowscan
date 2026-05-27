from pydantic import BaseModel, EmailStr
from typing import (
    List,
    Optional,
    Dict,
    Any
)

import datetime

# =========================
# AUTH SCHEMAS
# =========================

class Token(BaseModel):

    access_token: str

    token_type: str


class TokenData(BaseModel):

    email: Optional[str] = None


class UserCreate(BaseModel):

    email: EmailStr

    password: str


class UserResponse(BaseModel):

    id: int

    email: EmailStr

    is_verified: bool

    class Config:
        from_attributes = True


class UserVerify(BaseModel):

    email: EmailStr

    otp: str


class ForgotPassword(BaseModel):

    email: EmailStr


class ResetPassword(BaseModel):

    email: EmailStr

    otp: str

    new_password: str


# =========================
# SCAN SCHEMAS
# =========================

class ScanBase(BaseModel):

    prediction: str

    confidence_score: float

    recommendation: str


class ScanCreate(ScanBase):

    image_path: str


# REMEDY MODEL
class Remedy(BaseModel):

    title: str

    description: str


# FINAL RESPONSE MODEL
class ScanResponse(ScanBase):

    id: int

    image_path: Optional[str] = None

    seven_day_plan: Optional[
        Dict[str, Any]
    ] = {}

    home_remedies: Optional[
        List[Remedy]
    ] = []

    class Config:
        from_attributes = True


# =========================
# NOTIFICATION SCHEMAS
# =========================

class NotificationResponse(BaseModel):

    id: int

    user_id: int

    title: str

    message: str

    type: str

    is_read: bool

    timestamp: datetime.datetime

    class Config:
        from_attributes = True


# =========================
# CLERK AUTH
# =========================

class ClerkLogin(BaseModel):

    email: EmailStr

    clerk_token: str