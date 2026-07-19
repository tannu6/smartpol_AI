"""Mock AI services and ML pipeline integration for hackathon MVP."""

import random
import re
import uuid
import os

from .ml_pipeline.model import FraudRiskModel
from .ml_pipeline.train import train_and_save

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ml_pipeline', 'fraud_model.json')
ml_model = FraudRiskModel()

def get_ml_model():
    global ml_model
    if not ml_model.is_trained:
        if not os.path.exists(MODEL_PATH):
            train_and_save()
        ml_model.load(MODEL_PATH)
    return ml_model


def extract_entities(text: str) -> dict:
    phones = re.findall(r'\+?\d[\d\s-]{8,}\d', text)
    emails = re.findall(r'[\w.-]+@[\w.-]+\.\w+', text)
    amounts = re.findall(r'[\$₹]?\s?\d[\d,]*(?:\.\d{2})?', text)
    return {
        'phones': phones[:5],
        'emails': emails[:5],
        'amounts': amounts[:5],
        'locations': [],
        'confidence': round(random.uniform(0.75, 0.98), 2),
    }


def classify_fraud(text: str, category: str) -> dict:
    try:
        model = get_ml_model()
        analysis = model.analyze(text)
        if analysis:
            return {
                'classification': analysis['detected_patterns'][0],
                'confidence': analysis['fraud_probability'],
                'ml_analysis': analysis
            }
    except Exception as e:
        print(f"ML Model failed, falling back to rules: {e}")
        pass
    keywords = {
        'scam': ['otp', 'upi', 'refund', 'lottery', 'investment'],
        'cyber': ['hack', 'breach', 'phishing', 'malware'],
        'financial': ['transfer', 'account', 'bank', 'mule'],
    }
    score = 0.1
    label = 'legitimate'
    for fraud_type, words in keywords.items():
        if any(w in text.lower() for w in words):
            score = random.uniform(0.6, 0.95)
            label = fraud_type
            break
    return {'classification': label, 'confidence': round(score, 2)}


def compute_urgency_score(text: str, category: str) -> float:
    urgent_words = ['emergency', 'urgent', 'weapon', 'violence', 'sos', 'help', 'attack']
    base = 0.3
    for w in urgent_words:
        if w in text.lower():
            base += 0.15
    if category.lower() in ('assault', 'robbery', 'sos', 'emergency'):
        base += 0.3
    return round(min(base + random.uniform(0, 0.2), 1.0), 2)


def compute_readiness_score(complaint_data: dict) -> float:
    score = 0.2
    if complaint_data.get('description'):
        score += 0.2
    if complaint_data.get('location'):
        score += 0.15
    if complaint_data.get('entities_extracted'):
        score += 0.25
    return round(min(score + random.uniform(0, 0.15), 1.0), 2)


def generate_scam_dna(text: str) -> dict:
    return {
        'pattern_id': f'DNA-{uuid.uuid4().hex[:8].upper()}',
        'sequence': [
            {'step': 1, 'action': 'Initial Contact', 'confidence': 0.92},
            {'step': 2, 'action': 'Trust Building', 'confidence': 0.87},
            {'step': 3, 'action': 'Payment Request', 'confidence': 0.95},
            {'step': 4, 'action': 'Account Drain', 'confidence': 0.89},
        ],
        'confidence': round(random.uniform(0.8, 0.99), 2),
    }


def detect_mule_account(transactions: list) -> dict:
    # Explainable Mule Account detection logic
    if not transactions:
        return {
            'is_mule': False,
            'risk_level': 'low',
            'risk_score': 0,
            'confidence': 0.95,
            'indicators': [],
            'explanation': 'Insufficient transaction data to flag account.'
        }
        
    risk_score = 0
    indicators = []
    
    # Mock analysis over the transaction array
    tx_count = len(transactions)
    if tx_count > 10:
        risk_score += 30
        indicators.append('high_velocity')
    elif tx_count > 5:
        risk_score += 15
        
    # Let's assume some basic features triggered
    has_rapid_in_out = random.choice([True, False, False])
    has_kyc_mismatch = random.choice([True, False, False, False])
    has_round_amounts = random.choice([True, False])
    has_crypto_hop = random.choice([True, False, False])
    
    # Hardcode for demo if transactions is large enough
    if tx_count >= 3:
        has_rapid_in_out = True
        has_round_amounts = True
        
    if has_rapid_in_out:
        risk_score += 40
        indicators.append('rapid_in_out')
    
    if has_kyc_mismatch:
        risk_score += 25
        indicators.append('kyc_mismatch')
        
    if has_round_amounts:
        risk_score += 15
        indicators.append('round_amounts')
        
    if has_crypto_hop:
        risk_score += 20
        indicators.append('crypto_layering')

    # Clamp score
    risk_score = min(risk_score, 100)
    
    # Generate explainable string based on indicators
    explanations = []
    if 'rapid_in_out' in indicators:
        explanations.append("Immediate withdrawal or transfer of received funds detected.")
    if 'high_velocity' in indicators:
        explanations.append("Unusually high transaction frequency compared to historical baseline.")
    if 'kyc_mismatch' in indicators:
        explanations.append("Account profile attributes flag potential synthetic identity or mismatch.")
    if 'round_amounts' in indicators:
        explanations.append("Pattern of large, suspiciously round number transfers.")
    if 'crypto_layering' in indicators:
        explanations.append("Funds observed hopping to high-risk virtual asset service providers.")
        
    if not explanations:
        explanations.append("Account transaction behavior appears typical.")

    risk_level = 'low'
    if risk_score >= 80:
        risk_level = 'critical'
    elif risk_score >= 60:
        risk_level = 'high'
    elif risk_score >= 30:
        risk_level = 'medium'
        
    return {
        'is_mule': risk_score >= 60,
        'risk_level': risk_level,
        'risk_score': risk_score,
        'confidence': round(random.uniform(0.85, 0.99), 2),
        'indicators': indicators,
        'explanation': " | ".join(explanations)
    }


def fuse_identifiers(identifiers: list) -> dict:
    return {
        'fused_count': len(identifiers),
        'clusters': max(1, len(identifiers) // 3),
        'confidence': round(random.uniform(0.75, 0.95), 2),
    }


def golden_hour_alert(complaint) -> bool:
    return complaint.urgency_score >= 0.7
# Add to backend/api/ai_services.py

def build_ai_insight(urgency: float, fraud: dict, readiness: float) -> dict:
    """Unified explainability payload used by every AI-touched screen."""
    
    if 'ml_analysis' in fraud:
        ml = fraud['ml_analysis']
        priority_score = round((urgency * 0.4 + (1 - readiness) * 0.2 + ml['risk_score'] * 0.4), 2)
        threat_level = 'CRITICAL' if priority_score > 0.8 else 'HIGH' if priority_score > 0.6 else 'MODERATE' if priority_score > 0.3 else 'LOW'
        
        return {
            'threat_level': threat_level,
            'priority_score': priority_score,
            'reasoning': ml['explanation'],
            'suggested_next_action': ml['recommended_action'],
            'confidence': ml['fraud_probability'],
            'is_real_ml': True,
            'model_version': ml['model_version'],
            'detected_patterns': ml['detected_patterns'],
            'suspicious_indicators': ml['suspicious_indicators'],
            'risk_score': ml['risk_score'],
            'generated_at': __import__('django.utils.timezone', fromlist=['now']).now().isoformat(),
        }

    # Fallback to original mock logic
    if urgency >= 0.85:
        threat_level = 'CRITICAL'
    elif urgency >= 0.65:
        threat_level = 'HIGH'
    elif urgency >= 0.4:
        threat_level = 'MODERATE'
    else:
        threat_level = 'LOW'

    priority_score = round((urgency * 0.5 + (1 - readiness) * 0.2 + fraud.get('confidence', 0) * 0.3), 2)

    reasoning = []
    if urgency >= 0.7:
        reasoning.append("Urgency keywords and category weighting pushed the score above the golden-hour threshold.")
    if fraud.get('confidence', 0) > 0.6:
        reasoning.append(f"Text pattern matched known '{fraud.get('classification')}' indicators with high confidence.")
    if readiness < 0.5:
        reasoning.append("Case file is missing key fields (location/entities), lowering investigation readiness.")
    if not reasoning:
        reasoning.append("No high-risk indicators detected; standard triage applies.")

    if threat_level in ('CRITICAL', 'HIGH'):
        next_action = "Dispatch nearest available officer and escalate to supervisor immediately."
    elif threat_level == 'MODERATE':
        next_action = "Assign to investigation queue within 24 hours; monitor for escalation."
    else:
        next_action = "Log for routine review; no immediate action required."

    return {
        'threat_level': threat_level,
        'priority_score': priority_score,
        'reasoning': reasoning,
        'suggested_next_action': next_action,
        'confidence': fraud.get('confidence', 0.75),
        'is_real_ml': False,
        'generated_at': __import__('django.utils.timezone', fromlist=['now']).now().isoformat(),
    }