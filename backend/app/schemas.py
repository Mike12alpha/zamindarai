from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class FarmerCreate(BaseModel):
    name: str
    phone: str
    district: str
    farm_size_acres: Optional[float] = None
    primary_crop: Optional[str] = None


class FarmerResponse(FarmerCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class DiagnosisRequest(BaseModel):
    farmer_id: int
    crop_type: str
    # image will be uploaded as multipart


class DiagnosisResponse(BaseModel):
    id: int
    vision_analysis: str
    treatment: str
    created_at: datetime


class PriceCheckRequest(BaseModel):
    farmer_id: int
    crop: str
    quantity: str
    location: str
    offered_price: float


class PriceCheckResponse(BaseModel):
    analysis: str
    market_rate: Optional[float]
    is_fair: bool


class ContractRequest(BaseModel):
    farmer_id: int
    buyer_name: str
    crop: str
    quantity: str
    price_per_kg: float


class ContractResponse(BaseModel):
    contract_text: str
    is_fair: bool
    warnings: List[str]
    contract_hash: Optional[str] = None
    pdf_path: Optional[str] = None
    verify_url: Optional[str] = None
