import re

def normalize_phone(phone: str) -> str:
    """Normalize phone numbers to canonical E.164 standard (defaulting to +91 for India)."""
    if not phone:
        return ""
    digits = re.sub(r'[^\d+]', '', phone.strip())
    if digits.startswith('+'):
        return digits
    if len(digits) == 10 and digits[0] in '6789':
        return f"+91{digits}"
    if len(digits) == 11 and digits.startswith('0'):
        return f"+91{digits[1:]}"
    if len(digits) == 12 and digits.startswith('91'):
        return f"+{digits}"
    return digits or phone.strip()

def normalize_upi(upi: str) -> str:
    """Normalize UPI IDs by trimming spaces and lowercasing handle."""
    if not upi:
        return ""
    clean = upi.strip().lower()
    clean = re.sub(r'\s+', '', clean)
    return clean

def normalize_email(email: str) -> str:
    """Normalize email address by trimming spaces and lowercasing domain."""
    if not email:
        return ""
    clean = email.strip()
    if '@' in clean:
        parts = clean.split('@')
        return f"{parts[0]}@{parts[1].lower()}"
    return clean.lower()

def normalize_domain(url: str) -> str:
    """Extract canonical domain from URL or domain string."""
    if not url:
        return ""
    clean = url.strip().lower()
    clean = re.sub(r'^https?://', '', clean)
    clean = re.sub(r'^www\.', '', clean)
    clean = clean.split('/')[0].split('?')[0].split('#')[0]
    return clean

def normalize_entity(entity_type: str, value: str) -> dict:
    """Returns dict with original_value and normalized_value."""
    val = value.strip() if value else ""
    t = entity_type.lower()
    if t == 'phone':
        norm = normalize_phone(val)
    elif t == 'upi':
        norm = normalize_upi(val)
    elif t == 'email':
        norm = normalize_email(val)
    elif t in ('domain', 'url'):
        norm = normalize_domain(val)
    else:
        norm = val.lower()
    return {
        'entity_type': t,
        'original_value': val,
        'normalized_value': norm
    }
