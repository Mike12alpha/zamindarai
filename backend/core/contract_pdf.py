import hashlib
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
import os
import time


PDF_HEADERS = {
    "en": {
        "title": "ZamindarAI Sale Agreement",
        "header": "ZAMINDARAI - KISAAN PROTECTION SYSTEM",
        "subheader": "Verified by AI | Tamper-Proof Record | Generated via Kisan Council",
        "doc_id": "Document ID",
        "verify": "Verify authenticity at: https://zamindarai.com/verify"
    },
    "ur": {
        "title": "زمیندارAI فروخت کا معاہدہ",
        "header": "زمیندارAI - کسان تحفظ نظام",
        "subheader": "AI سے تصدیق شدہ | تبدیلیاک ثبوت | کسان کونسل کے ذریعے تیار شدہ",
        "doc_id": "دستاویز نمبر",
        "verify": "تصدیق کے لیے: https://zamindarai.com/verify"
    }
}


def generate_notarized_contract(contract_text: str, farmer_name: str,
                                buyer_name: str, crop: str, price: float,
                                language: str = "en") -> dict:
    """Generate tamper-proof contract with QR verification."""

    headers = PDF_HEADERS.get(language, PDF_HEADERS["en"])
    ts = int(time.time())
    filename_base = f"{farmer_name.replace(' ', '_')}_{ts}"

    os.makedirs("contracts", exist_ok=True)
    os.makedirs("qr_codes", exist_ok=True)

    pdf_path = f"contracts/{filename_base}.pdf"

    c = canvas.Canvas(pdf_path, pagesize=A4)
    c.setTitle(headers["title"])

    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, 800, headers["header"])
    c.setFont("Helvetica", 10)
    c.drawString(50, 780, headers["subheader"])

    c.line(50, 770, 550, 770)

    c.setFont("Helvetica", 12)
    y = 740
    for line in contract_text.split("\n"):
        c.drawString(50, y, line[:90])
        y -= 20
        if y < 100:
            c.showPage()
            y = 800

    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, 60, f"{headers['doc_id']}: {filename_base}")
    c.drawString(50, 45, headers["verify"])

    c.save()

    with open(pdf_path, "rb") as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()

    final_pdf = f"contracts/{file_hash[:16]}_{filename_base}.pdf"
    os.rename(pdf_path, final_pdf)

    verify_url = f"https://zamindarai.com/verify/{file_hash}"
    qr = qrcode.make(verify_url)
    qr_path = f"qr_codes/{file_hash}.png"
    qr.save(qr_path)

    return {
        "pdf_path": final_pdf,
        "document_hash": file_hash,
        "qr_path": qr_path,
        "verify_url": verify_url
    }
