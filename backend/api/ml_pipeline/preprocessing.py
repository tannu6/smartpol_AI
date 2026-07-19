import re

def clean_text(text: str) -> str:
    """Normalize and clean input text for feature extraction."""
    if not text:
        return ""
    text = text.lower()
    # Remove non-alphanumeric characters except spaces
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    # Collapse multiple spaces
    text = re.sub(r'\s+', ' ', text)
    return text.strip()
