import sys
import os

# Determine project root (parent of scripts/)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")

sys.path.append(BACKEND_DIR)

from core.vector_store import kb
from langchain_community.document_loaders import TextLoader
from langchain_core.documents import Document
import csv


def ingest_crop_diseases():
    docs = []
    data_dir = os.path.join(BACKEND_DIR, "data", "crop_diseases")
    if not os.path.exists(data_dir):
        print(f"[!] Directory not found: {data_dir}")
        return

    for file in os.listdir(data_dir):
        filepath = os.path.join(data_dir, file)
        if file.endswith(".pdf"):
            try:
                from langchain_community.document_loaders import PyPDFLoader
                loader = PyPDFLoader(filepath)
                docs.extend(loader.load())
            except Exception as e:
                print(f"[!] Could not load PDF {file}: {e}")
        elif file.endswith(".txt"):
            loader = TextLoader(filepath, encoding="utf-8")
            docs.extend(loader.load())

    if docs:
        count = kb.ingest(docs, "crop_diseases")
        print(f"[OK] Ingested {count} crop disease chunks")
    else:
        print("[!] No crop disease documents found")


def ingest_soil_guides():
    docs = []
    data_dir = os.path.join(BACKEND_DIR, "data", "soil_guides")
    if not os.path.exists(data_dir):
        print(f"[!] Directory not found: {data_dir}")
        return

    for file in os.listdir(data_dir):
        filepath = os.path.join(data_dir, file)
        if file.endswith(".pdf"):
            try:
                from langchain_community.document_loaders import PyPDFLoader
                loader = PyPDFLoader(filepath)
                docs.extend(loader.load())
            except Exception as e:
                print(f"[!] Could not load PDF {file}: {e}")
        elif file.endswith(".txt"):
            loader = TextLoader(filepath, encoding="utf-8")
            docs.extend(loader.load())

    if docs:
        count = kb.ingest(docs, "soil_guides")
        print(f"[OK] Ingested {count} soil guide chunks")
    else:
        print("[!] No soil guide documents found")


def ingest_mandi_prices():
    csv_path = os.path.join(BACKEND_DIR, "data", "mandi_prices.csv")
    docs = []

    if not os.path.exists(csv_path):
        print(f"[!] File not found: {csv_path}")
        return

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            content = (
                f"Crop: {row['crop']}. Market: {row['mandi']}. "
                f"Date: {row['date']}. Price range: PKR {row['min']}-{row['max']}. "
                f"Average: PKR {row['avg']} per {row.get('unit', '40kg')}."
            )
            docs.append(Document(page_content=content, metadata=row))

    if docs:
        count = kb.ingest(docs, "mandi_prices")
        print(f"[OK] Ingested {count} price records")
    else:
        print("[!] No price records found")


if __name__ == "__main__":
    os.makedirs(os.path.join(BACKEND_DIR, "data"), exist_ok=True)
    ingest_crop_diseases()
    ingest_soil_guides()
    ingest_mandi_prices()
    print("\n[OK] All knowledge bases ready!")
