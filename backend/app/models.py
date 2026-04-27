from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True)
    district = Column(String(50))
    farm_size_acres = Column(Float)
    primary_crop = Column(String(50))
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    diagnoses = relationship("Diagnosis", back_populates="farmer")
    price_checks = relationship("PriceCheck", back_populates="farmer")
    contracts = relationship("Contract", back_populates="farmer")


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    crop_type = Column(String(50))
    image_path = Column(String(255))
    vision_analysis = Column(Text)
    treatment = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    farmer = relationship("Farmer", back_populates="diagnoses")


class PriceCheck(Base):
    __tablename__ = "price_checks"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    crop = Column(String(50))
    quantity = Column(String(20))
    offered_price = Column(Float)
    market_rate = Column(Float)
    analysis = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    farmer = relationship("Farmer", back_populates="price_checks")


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    buyer_name = Column(String(100))
    crop = Column(String(50))
    quantity = Column(String(20))
    price_per_kg = Column(Float)
    contract_text = Column(Text)
    is_fair = Column(Integer, default=1)  # 1=yes, 0=no
    contract_hash = Column(String(64), nullable=True)
    pdf_path = Column(String(255), nullable=True)

    farmer = relationship("Farmer", back_populates="contracts")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    message = Column(Text)
    agent_plan = Column(String(100))  # e.g., "CropDoctor+PriceOracle"
    response = Column(Text)
    image_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class OutbreakAlert(Base):
    __tablename__ = "outbreak_alerts"

    id = Column(Integer, primary_key=True)
    district = Column(String(50))
    crop_type = Column(String(50))
    disease_signature = Column(String(100))
    case_count = Column(Integer)
    first_reported = Column(DateTime, server_default=func.now())
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())
