import math
import json
import os
from .features import FeatureExtractor

class FraudRiskModel:
    """Multinomial Naive Bayes classifier built from scratch for text classification without external ML dependencies."""
    
    def __init__(self):
        self.extractor = FeatureExtractor()
        self.class_counts = {}
        self.word_counts = {}
        self.total_words = {}
        self.vocab_size = 0
        self.is_trained = False
        self.version = "1.0.0-pure-py"

    def fit(self, texts, labels):
        self.extractor.fit(texts)
        self.vocab_size = len(self.extractor.vocab)
        
        for text, label in zip(texts, labels):
            self.class_counts[label] = self.class_counts.get(label, 0) + 1
            if label not in self.word_counts:
                self.word_counts[label] = [0] * self.vocab_size
                self.total_words[label] = 0
                
            features = self.extractor.transform(text)
            for i, count in enumerate(features['vector']):
                self.word_counts[label][i] += count
                self.total_words[label] += count
        
        self.is_trained = True

    def predict_proba(self, text):
        if not self.is_trained:
            raise ValueError("Model is not trained.")
            
        features = self.extractor.transform(text)
        probs = {}
        total_docs = sum(self.class_counts.values())
        
        for label in self.class_counts:
            # log(P(class))
            log_prob = math.log(self.class_counts[label] / total_docs)
            
            # log(P(words | class)) using Laplace smoothing
            for i, count in enumerate(features['vector']):
                if count > 0:
                    word_prob = (self.word_counts[label][i] + 1) / (self.total_words[label] + self.vocab_size)
                    log_prob += count * math.log(word_prob)
            probs[label] = log_prob
            
        # Convert log probabilities back using Softmax
        max_log = max(probs.values())
        exp_probs = {k: math.exp(v - max_log) for k, v in probs.items()}
        sum_exp = sum(exp_probs.values())
        return {k: v / sum_exp for k, v in exp_probs.items()}
        
    def analyze(self, text):
        if not self.is_trained:
            return None
            
        probs = self.predict_proba(text)
        sorted_probs = sorted(probs.items(), key=lambda x: x[1], reverse=True)
        top_class, top_prob = sorted_probs[0]
        
        features = self.extractor.transform(text)
        indicators = []
        if features['phones'] > 0: indicators.append("Phone numbers extracted")
        if features['amounts'] > 0: indicators.append("Financial amounts detected")
        if features['emails'] > 0: indicators.append("Email addresses extracted")
        if features['urgency_count'] > 0: indicators.append(f"Detected {features['urgency_count']} urgency keywords")
        
        # Calculate risk score based on probability, class, and meta features
        risk_score = top_prob
        if top_class != 'general':
            risk_score = min(top_prob + (len(indicators) * 0.1), 1.0)
        else:
            risk_score = top_prob * 0.3
            if features['urgency_count'] > 0:
                risk_score += min(0.4, features['urgency_count'] * 0.15)
                
        risk_score = min(1.0, risk_score)
        
        explanation = [
            f"Machine Learning model classified text as '{top_class}' with {top_prob*100:.1f}% confidence.",
            f"Found {len(indicators)} structural/meta indicators."
        ]
        
        return {
            'risk_score': round(risk_score, 2),
            'risk_level': 'CRITICAL' if risk_score > 0.8 else 'HIGH' if risk_score > 0.6 else 'MEDIUM' if risk_score > 0.3 else 'LOW',
            'fraud_probability': round(top_prob, 2),
            'detected_patterns': [top_class],
            'suspicious_indicators': indicators,
            'explanation': explanation,
            'recommended_action': 'Escalate to Cyber Unit' if top_class != 'general' else 'Standard Investigation Triage',
            'model_version': self.version,
            'is_real_ml': True
        }

    def save(self, filepath):
        data = {
            'vocab': self.extractor.vocab,
            'class_counts': self.class_counts,
            'word_counts': self.word_counts,
            'total_words': self.total_words,
            'vocab_size': self.vocab_size
        }
        with open(filepath, 'w') as f:
            json.dump(data, f)
            
    def load(self, filepath):
        if not os.path.exists(filepath):
            return False
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
                self.extractor.vocab = data['vocab']
                self.class_counts = data['class_counts']
                self.word_counts = data['word_counts']
                self.total_words = data['total_words']
                self.vocab_size = data['vocab_size']
                self.is_trained = True
            return True
        except Exception:
            return False
