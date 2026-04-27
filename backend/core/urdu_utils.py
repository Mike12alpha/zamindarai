import re


class RomanUrduProcessor:
    """Normalizes common Roman Urdu variations for better RAG matching."""

    MAPPINGS = {
        r'\bkia\b': 'kya',
        r'\bhaan\b': 'han',
        r'\bqeemat\b': 'qeemat',
        r'\bkhad\b': 'khad',
        r'\bmitti\b': 'mitti',
        r'\bzameen\b': 'zameen',
        r'\bgandum\b': 'gandum',
        r'\bdhan\b': 'dhan',
        r'\bchawal\b': 'chawal',
        r'\bkapas\b': 'kapas',
        r'\bkimat\b': 'qeemat',
        r'\bnaq\b': 'naq',
        r'\bnuksaan\b': 'nuksaan',
    }

    @classmethod
    def normalize(cls, text: str) -> str:
        text = text.lower()
        for pattern, replacement in cls.MAPPINGS.items():
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        return text
