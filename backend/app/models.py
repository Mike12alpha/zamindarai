from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(20))
    district = Column(String(50))
    farm_size_acres = Column(Float, default=0)
    primary_crop = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    diagnoses = relationship("Diagnosis", back_populates="user", cascade="all, delete")
    price_checks = relationship("PriceCheck", back_populates="user", cascade="all, delete")
    contracts = relationship("Contract", back_populates="user", cascade="all, delete")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete")


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    crop_type = Column(String(50))
    image_path = Column(String(255))
    vision_analysis = Column(Text)
    treatment = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="diagnoses")


class PriceCheck(Base):
    __tablename__ = "price_checks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    crop = Column(String(50))
    quantity = Column(String(20))
    offered_price = Column(Float)
    market_rate = Column(Float)
    analysis = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="price_checks")


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    buyer_name = Column(String(100))
    crop = Column(String(50))
    quantity = Column(String(20))
    price_per_kg = Column(Float)
    contract_text = Column(Text)
    is_fair = Column(Integer, default=1)
    contract_hash = Column(String(64), nullable=True)
    pdf_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="contracts")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text)
    agent_plan = Column(String(100))
    response = Column(Text)
    image_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="chat_sessions")


class OutbreakAlert(Base):
    __tablename__ = "outbreak_alerts"

    id = Column(Integer, primary_key=True)
    district = Column(String(50))
    crop_type = Column(String(50))
    disease_signature = Column(String(100))
    case_count = Column(Integer)
    first_reported = Column(DateTime, server_default=func.now())
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())
