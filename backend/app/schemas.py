from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    district: Optional[str] = "Lahore"
    farm_size_acres: Optional[float] = 0
    primary_crop: Optional[str] = "Wheat"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    phone: Optional[str]
    district: Optional[str]
    farm_size_acres: Optional[float]
    primary_crop: Optional[str]

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class PriceCheckRequest(BaseModel):
    crop: str
    quantity: str
    location: str
    offered_price: float
    language: str = "en"


class PriceCheckResponse(BaseModel):
    analysis: str
    market_rate: Optional[float]
    is_fair: bool


class ContractRequest(BaseModel):
    buyer_name: str
    crop: str
    quantity: str
    price_per_kg: float
    language: str = "en"


class SoilAdviseRequest(BaseModel):
    location: str
    current_crop: str
    previous_crop: str
    soil_type: str
    question: str
    language: str = "en"


class ChatRequest(BaseModel):
    message: str
    language: str = "en"
