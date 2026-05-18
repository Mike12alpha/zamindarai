import os

EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
PERSIST_DIR = os.path.join(os.path.dirname(__file__), "..", "chroma_db")


class KnowledgeBase:
    def __init__(self):
        self._embeddings = None
        self._text_splitter = None

    @property
    def text_splitter(self):
        if self._text_splitter is None:
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            self._text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=500, chunk_overlap=50
            )
        return self._text_splitter

    @property
    def embeddings(self):
        if self._embeddings is None:
            from langchain_huggingface import HuggingFaceEmbeddings
            self._embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
        return self._embeddings

    def get_store(self, collection_name: str):
        from langchain_chroma import Chroma
        return Chroma(
            collection_name=collection_name,
            embedding_function=self.embeddings,
            persist_directory=f"{PERSIST_DIR}/{collection_name}"
        )

    def ingest(self, documents: list, collection_name: str):
        chunks = self.text_splitter.split_documents(documents)
        store = self.get_store(collection_name)
        store.add_documents(chunks)
        return len(chunks)

    def search(self, query: str, collection_name: str, k: int = 4):
        store = self.get_store(collection_name)
        return store.similarity_search(query, k=k)


_kb = None


def get_kb():
    global _kb
    if _kb is None:
        _kb = KnowledgeBase()
    return _kb
