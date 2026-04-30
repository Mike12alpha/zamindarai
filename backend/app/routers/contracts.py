from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import require_user
from agents.deal_guardian import DealGuardianAgent
from core.contract_pdf import generate_notarized_contract

router = APIRouter(prefix="/contracts", tags=["Deal Guardian"])
agent = DealGuardianAgent()


@router.post("/generate")
def generate_contract(
    request: schemas.ContractRequest,
    user: models.User = Depends(require_user),
    db: Session = Depends(get_db)
):
    result = agent.run(
        farmer_name=user.name,
        buyer_name=request.buyer_name,
        crop=request.crop,
        quantity=request.quantity,
        price_per_kg=request.price_per_kg,
        market_rate=None,
        language="en"
    )

    pdf_info = generate_notarized_contract(
        contract_text=result["contract_text"],
        farmer_name=user.name,
        buyer_name=request.buyer_name,
        crop=request.crop,
        price=request.price_per_kg
    )

    contract = models.Contract(
        user_id=user.id,
        buyer_name=request.buyer_name,
        crop=request.crop,
        quantity=request.quantity,
        price_per_kg=request.price_per_kg,
        contract_text=result["contract_text"],
        is_fair=1 if result["is_fair"] else 0,
        contract_hash=pdf_info["document_hash"],
        pdf_path=pdf_info["pdf_path"],
    )
    db.add(contract)
    db.commit()

    return {
        "contract_text": result["contract_text"],
        "is_fair": result["is_fair"],
        "warnings": result["warnings"],
        "pdf_url": pdf_info["pdf_path"],
        "qr_url": pdf_info["qr_path"],
        "document_hash": pdf_info["document_hash"],
    }
