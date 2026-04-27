from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from agents import get_agent
from core.contract_pdf import generate_notarized_contract

router = APIRouter(prefix="/contracts", tags=["Deal Guardian"])


@router.post("/generate", response_model=schemas.ContractResponse)
def generate_contract(request: schemas.ContractRequest, db: Session = Depends(get_db)):
    farmer = db.query(models.Farmer).filter(models.Farmer.id == request.farmer_id).first()
    farmer_name = farmer.name if farmer else "Kisaan"

    # Get latest market rate if available
    latest_price = db.query(models.PriceCheck).filter(
        models.PriceCheck.farmer_id == request.farmer_id,
        models.PriceCheck.crop == request.crop
    ).order_by(models.PriceCheck.created_at.desc()).first()

    market_rate = latest_price.market_rate if latest_price else None

    agent = get_agent("deal_guardian")
    result = agent.run(
        farmer_name=farmer_name,
        buyer_name=request.buyer_name,
        crop=request.crop,
        quantity=request.quantity,
        price_per_kg=request.price_per_kg,
        market_rate=market_rate
    )

    db_contract = models.Contract(
        farmer_id=request.farmer_id,
        buyer_name=request.buyer_name,
        crop=request.crop,
        quantity=request.quantity,
        price_per_kg=request.price_per_kg,
        contract_text=result["contract_text"],
        is_fair=1 if result["is_fair"] else 0
    )
    db.add(db_contract)
    db.commit()

    return {
        "contract_text": result["contract_text"],
        "is_fair": result["is_fair"],
        "warnings": result["warnings"]
    }


@router.post("/generate/notarized", response_model=schemas.ContractResponse)
def generate_notarized_contract_endpoint(request: schemas.ContractRequest, db: Session = Depends(get_db)):
    farmer = db.query(models.Farmer).filter(models.Farmer.id == request.farmer_id).first()
    farmer_name = farmer.name if farmer else "Kisaan"

    # Get latest market rate if available
    latest_price = db.query(models.PriceCheck).filter(
        models.PriceCheck.farmer_id == request.farmer_id,
        models.PriceCheck.crop == request.crop
    ).order_by(models.PriceCheck.created_at.desc()).first()

    market_rate = latest_price.market_rate if latest_price else None

    agent = get_agent("deal_guardian")
    result = agent.run(
        farmer_name=farmer_name,
        buyer_name=request.buyer_name,
        crop=request.crop,
        quantity=request.quantity,
        price_per_kg=request.price_per_kg,
        market_rate=market_rate
    )

    # Generate PDF + QR
    notarization = generate_notarized_contract(
        contract_text=result["contract_text"],
        farmer_name=farmer_name,
        buyer_name=request.buyer_name,
        crop=request.crop,
        price=request.price_per_kg
    )

    db_contract = models.Contract(
        farmer_id=request.farmer_id,
        buyer_name=request.buyer_name,
        crop=request.crop,
        quantity=request.quantity,
        price_per_kg=request.price_per_kg,
        contract_text=result["contract_text"],
        is_fair=1 if result["is_fair"] else 0,
        contract_hash=notarization["document_hash"],
        pdf_path=notarization["pdf_path"]
    )
    db.add(db_contract)
    db.commit()

    return {
        "contract_text": result["contract_text"],
        "is_fair": result["is_fair"],
        "warnings": result["warnings"],
        "contract_hash": notarization["document_hash"],
        "pdf_path": notarization["pdf_path"],
        "verify_url": notarization["verify_url"]
    }


@router.get("/verify/{document_hash}")
def verify_contract(document_hash: str, db: Session = Depends(get_db)):
    contract = db.query(models.Contract).filter(models.Contract.contract_hash == document_hash).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    return {
        "verified": True,
        "farmer_name": contract.farmer.name if contract.farmer else "Unknown",
        "crop": contract.crop,
        "price": contract.price_per_kg,
        "is_fair": bool(contract.is_fair),
        "document_hash": contract.contract_hash
    }
