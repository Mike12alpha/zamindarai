from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
import os

EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
PERSIST_DIR = "./chroma_db"


class KnowledgeBase:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500, chunk_overlap=50
        )

    def get_store(self, collection_name: str):
        return Chroma(
            collection_name=collection_name,
            embedding_function=self.embeddings,
            persist_directory=f"{PERSIST_DIR}/{collection_name}"
        )

    def ingest(self, documents: list[Document], collection_name: str):
        chunks = self.text_splitter.split_documents(documents)
        store = self.get_store(collection_name)
        store.add_documents(chunks)
        return len(chunks)

    def search(self, query: str, collection_name: str, k: int = 4):
        store = self.get_store(collection_name)
        return store.similarity_search(query, k=k)


# Singleton
kb = KnowledgeBase()
