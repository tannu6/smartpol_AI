"""Mock AI services for hackathon MVP."""

import random
import re
import uuid


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
    return {
        'is_mule': len(transactions) > 3,
        'risk_level': random.choice(['low', 'medium', 'high', 'critical']),
        'confidence': round(random.uniform(0.7, 0.98), 2),
        'indicators': ['rapid_in_out', 'multiple_sources', 'round_amounts'],
    }


def fuse_identifiers(identifiers: list) -> dict:
    return {
        'fused_count': len(identifiers),
        'clusters': max(1, len(identifiers) // 3),
        'confidence': round(random.uniform(0.75, 0.95), 2),
    }


def golden_hour_alert(complaint) -> bool:
    return complaint.urgency_score >= 0.7
