"""Custom validators for the customer support system."""
import re
from marshmallow import ValidationError


def validate_email_rfc5322(email):
    """Validate email address against RFC 5322 standard."""
    # RFC 5322 compliant email regex
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValidationError('Invalid email format')
    
    # Check for valid domain
    domain = email.split('@')[1]
    if '..' in domain or domain.startswith('.') or domain.endswith('.'):
        raise ValidationError('Invalid email domain')
    
    return True


def validate_subject(subject):
    """Validate ticket subject."""
    if not subject or len(subject.strip()) < 5:
        raise ValidationError('Subject must be at least 5 characters')
    if len(subject) > 200:
        raise ValidationError('Subject cannot exceed 200 characters')
    
    # Allow alphanumeric and common punctuation
    pattern = r'^[a-zA-Z0-9\s.,!?\'"-:;()@#$%&*+=\[\]{}|\\/<>]+$'
    if not re.match(pattern, subject):
        raise ValidationError('Subject contains invalid characters')
    
    return True


def validate_description(description):
    """Validate ticket description."""
    if not description or len(description.strip()) < 20:
        raise ValidationError('Description must be at least 20 characters')
    if len(description) > 5000:
        raise ValidationError('Description cannot exceed 5000 characters')
    
    return True


def validate_password_strength(password):
    """Validate password strength requirements."""
    errors = []
    
    if len(password) < 8:
        errors.append('Password must be at least 8 characters')
    if len(password) > 128:
        errors.append('Password cannot exceed 128 characters')
    if not any(c.isupper() for c in password):
        errors.append('Password must contain at least one uppercase letter')
    if not any(c.islower() for c in password):
        errors.append('Password must contain at least one lowercase letter')
    if not any(c.isdigit() for c in password):
        errors.append('Password must contain at least one digit')
    if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password):
        errors.append('Password must contain at least one special character')
    
    if errors:
        raise ValidationError(errors)
    
    return True


def validate_file_type(filename):
    """Validate file type for attachments."""
    allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
    
    if '.' not in filename:
        raise ValidationError('File must have an extension')
    
    ext = filename.rsplit('.', 1)[1].lower()
    if ext not in allowed_extensions:
        raise ValidationError(f'File type .{ext} not allowed. Allowed types: {", ".join(allowed_extensions)}')
    
    return True


def validate_file_size(size_bytes, max_size=5*1024*1024):
    """Validate file size (default max 5MB)."""
    if size_bytes > max_size:
        max_mb = max_size / (1024 * 1024)
        raise ValidationError(f'File size exceeds maximum allowed ({max_mb}MB)')
    
    return True


def sanitize_html(content):
    """Sanitize HTML content to prevent XSS attacks."""
    import html
    
    # Escape HTML entities
    sanitized = html.escape(content)
    
    # Remove any script tags that might have been encoded
    script_patterns = [
        r'&lt;script.*?&gt;.*?&lt;/script&gt;',
        r'javascript:',
        r'on\w+\s*=',
    ]
    
    for pattern in script_patterns:
        sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)
    
    return sanitized


