import re
import math
from .preprocessing import clean_text

class FeatureExtractor:
    """Extracts TF-IDF weighted unigram/bigram features and meta-features from complaint text."""
    
    def __init__(self, vocab=None, idf=None):
        self.vocab = vocab or {}
        self.idf = idf or {}
        
    def _extract_tokens(self, text):
        clean = clean_text(text)
        words = [w for w in clean.split() if len(w) > 1]
        bigrams = [f"{words[i]}_{words[i+1]}" for i in range(len(words)-1)]
        return words + bigrams

    def fit(self, texts):
        doc_count = len(texts)
        df = {}
        for text in texts:
            tokens = set(self._extract_tokens(text))
            for tok in tokens:
                df[tok] = df.get(tok, 0) + 1
        
        # Keep top 1500 most informative tokens
        sorted_tokens = sorted(df.items(), key=lambda x: x[1], reverse=True)[:1500]
        self.vocab = {tok: i for i, (tok, count) in enumerate(sorted_tokens)}
        
        # Compute Inverse Document Frequency (IDF) with smoothing
        self.idf = {
            tok: math.log((doc_count + 1) / (count + 1)) + 1.0
            for tok, count in self.vocab.items()
        }
        return self

    def transform(self, text):
        tokens = self._extract_tokens(text)
        vector = [0.0] * len(self.vocab)
        
        if tokens:
            for tok in tokens:
                if tok in self.vocab:
                    idx = self.vocab[tok]
                    idf = self.idf.get(tok, 1.0)
                    vector[idx] += round(1.0 * idf, 2)
        
        # Meta-features
        phones = len(re.findall(r'\+?\d[\d\s-]{8,}\d', text))
        emails = len(re.findall(r'[\w.-]+@[\w.-]+\.\w+', text))
        amounts = len(re.findall(r'[\$₹]?\s?\d[\d,]*(?:\.\d{2})?', text))
        
        # Urgency keywords
        urgent_words = ['emergency', 'urgent', 'weapon', 'violence', 'sos', 'help', 'attack', 'stolen', 'hacked', 'breach', 'blackmail', 'extortion']
        text_lower = text.lower()
        urgency_count = sum(1 for w in urgent_words if re.search(r'\b' + re.escape(w) + r'\b', text_lower))
        
        return {
            'vector': vector,
            'phones': phones,
            'emails': emails,
            'amounts': amounts,
            'urgency_count': urgency_count
        }

