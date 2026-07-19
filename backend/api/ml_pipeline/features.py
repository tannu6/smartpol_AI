import re
from .preprocessing import clean_text

class FeatureExtractor:
    """Extracts Bag of Words and Meta-features from complaint text."""
    
    def __init__(self, vocab=None):
        self.vocab = vocab or {}
        
    def fit(self, texts):
        word_counts = {}
        for text in texts:
            words = clean_text(text).split()
            for w in words:
                word_counts[w] = word_counts.get(w, 0) + 1
        
        # Keep top 1000 most frequent words
        sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)[:1000]
        self.vocab = {w: i for i, (w, c) in enumerate(sorted_words)}
        return self

    def transform(self, text):
        words = clean_text(text).split()
        vector = [0] * len(self.vocab)
        for w in words:
            if w in self.vocab:
                vector[self.vocab[w]] += 1
        
        # Meta-features
        phones = len(re.findall(r'\+?\d[\d\s-]{8,}\d', text))
        emails = len(re.findall(r'[\w.-]+@[\w.-]+\.\w+', text))
        amounts = len(re.findall(r'[\$₹]?\s?\d[\d,]*(?:\.\d{2})?', text))
        
        # Urgency keywords
        urgent_words = ['emergency', 'urgent', 'weapon', 'violence', 'sos', 'help', 'attack', 'stolen', 'hacked', 'breach']
        urgency_count = sum(1 for w in words if w in urgent_words)
        
        return {
            'vector': vector,
            'phones': phones,
            'emails': emails,
            'amounts': amounts,
            'urgency_count': urgency_count
        }
