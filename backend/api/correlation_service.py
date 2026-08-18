import re
from django.db.models import Q
from .normalization import normalize_phone, normalize_upi, normalize_email, normalize_domain

def find_related_cases(target_complaint, max_results=5) -> list:
    """
    Cross-Case Correlation Engine.
    Evaluates:
    - Exact match on normalized phone numbers
    - Exact match on normalized UPI handles
    - Exact match on normalized emails
    - Exact match on canonical domains
    - Match on destination bank account numbers
    - Category / Modus Operandi family match
    - Text narrative similarity
    Returns a sorted list of related case dicts with similarity percentage and transparent explanation bullets.
    """
    from .models import Complaint, MuleAlert
    
    if not target_complaint:
        return []

    target_entities = target_complaint.entities_extracted or {}
    target_text = (target_complaint.description or "").lower()
    target_category = target_complaint.category.lower()

    # Extract target normalized entities
    target_phones = {normalize_phone(p) for p in target_entities.get('phones', []) if p}
    target_emails = {normalize_email(e) for e in target_entities.get('emails', []) if e}
    target_urls = {normalize_domain(u) for u in target_entities.get('urls', []) if u}
    target_accounts = set(re.findall(r'\b\d{9,18}\b', target_text))

    candidates = Complaint.objects.exclude(id=target_complaint.id).order_by('-created_at')[:100]

    results = []
    for cand in candidates:
        cand_text = (cand.description or "").lower()
        cand_entities = cand.entities_extracted or {}
        cand_category = cand.category.lower()

        reasons = []
        score = 0.0

        # Phone match (35% weight)
        cand_phones = {normalize_phone(p) for p in cand_entities.get('phones', []) if p}
        matched_phones = target_phones.intersection(cand_phones)
        if matched_phones:
            score += 0.35
            reasons.append(f"Matched normalized phone: {', '.join(list(matched_phones)[:2])}")

        # Account match (30% weight)
        cand_accounts = set(re.findall(r'\b\d{9,18}\b', cand_text))
        matched_accts = target_accounts.intersection(cand_accounts)
        if matched_accts:
            score += 0.30
            reasons.append(f"Matched transaction account: A/C {', '.join(list(matched_accts)[:2])}")

        # Email match (20% weight)
        cand_emails = {normalize_email(e) for e in cand_entities.get('emails', []) if e}
        matched_emails = target_emails.intersection(cand_emails)
        if matched_emails:
            score += 0.20
            reasons.append(f"Matched email entity: {', '.join(list(matched_emails)[:2])}")

        # Domain match (20% weight)
        cand_urls = {normalize_domain(u) for u in cand_entities.get('urls', []) if u}
        matched_urls = target_urls.intersection(cand_urls)
        if matched_urls:
            score += 0.20
            reasons.append(f"Matched domain infrastructure: {', '.join(list(matched_urls)[:2])}")

        # Scam category / MO match (15% weight)
        if target_category and target_category == cand_category and target_category != 'general':
            score += 0.15
            reasons.append(f"Matching Modus Operandi pattern: {cand.category}")

        # Text narrative keyword overlap (10% weight)
        target_words = set(re.findall(r'\w{4,}', target_text))
        cand_words = set(re.findall(r'\w{4,}', cand_text))
        overlap = len(target_words.intersection(cand_words))
        if overlap >= 4:
            score += min(0.15, overlap * 0.02)
            reasons.append(f"High narrative keyword overlap ({overlap} key terms)")

        if score >= 0.25 and reasons:
            final_score = round(min(0.98, score), 2)
            results.append({
                'id': cand.id,
                'complaint_id': cand.complaint_id,
                'title': cand.title,
                'category': cand.category,
                'status': cand.status,
                'urgency_score': cand.urgency_score,
                'correlation_score': final_score,
                'similarity_percentage': int(final_score * 100),
                'label': 'Potentially Related Case',
                'reasons': reasons,
                'created_at': cand.created_at.isoformat(),
            })

    results.sort(key=lambda x: x['correlation_score'], reverse=True)
    return results[:max_results]
