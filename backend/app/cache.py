"""Redis caching utilities for performance optimization."""
import json
import functools
from flask import request, g
from app.extensions import cache


# Cache key prefixes
CACHE_PREFIX = {
    'ticket': 'ticket:',
    'tickets_list': 'tickets:list:',
    'user': 'user:',
    'dashboard': 'dashboard:',
    'agent_stats': 'agent:stats:',
    'sla_metrics': 'sla:metrics:',
}

# Cache TTL in seconds
CACHE_TTL = {
    'ticket': 300,          # 5 minutes
    'tickets_list': 60,     # 1 minute
    'user': 600,            # 10 minutes
    'dashboard': 120,       # 2 minutes
    'agent_stats': 180,     # 3 minutes
    'sla_metrics': 300,     # 5 minutes
}


def make_cache_key(*args, **kwargs):
    """Generate cache key from function arguments."""
    key_parts = [str(arg) for arg in args]
    key_parts.extend(f'{k}={v}' for k, v in sorted(kwargs.items()))
    return ':'.join(key_parts)


def get_ticket_cache_key(ticket_id):
    """Get cache key for a single ticket."""
    return f"{CACHE_PREFIX['ticket']}{ticket_id}"


def get_tickets_list_cache_key(user_id, **filters):
    """Get cache key for tickets list."""
    filter_str = make_cache_key(**filters) if filters else 'all'
    return f"{CACHE_PREFIX['tickets_list']}{user_id}:{filter_str}"


def get_user_cache_key(user_id):
    """Get cache key for user data."""
    return f"{CACHE_PREFIX['user']}{user_id}"


def get_dashboard_cache_key():
    """Get cache key for dashboard metrics."""
    return f"{CACHE_PREFIX['dashboard']}metrics"


def get_agent_stats_cache_key(agent_id):
    """Get cache key for agent statistics."""
    return f"{CACHE_PREFIX['agent_stats']}{agent_id}"


# ============================================================================
# Cache Operations
# ============================================================================

def cache_get(key):
    """Get value from cache."""
    try:
        value = cache.get(key)
        if value:
            return json.loads(value) if isinstance(value, str) else value
        return None
    except Exception:
        return None


def cache_set(key, value, ttl=300):
    """Set value in cache with TTL."""
    try:
        if not isinstance(value, str):
            value = json.dumps(value, default=str)
        cache.set(key, value, timeout=ttl)
        return True
    except Exception:
        return False


def cache_delete(key):
    """Delete key from cache."""
    try:
        cache.delete(key)
        return True
    except Exception:
        return False


def cache_delete_pattern(pattern):
    """Delete all keys matching pattern."""
    try:
        # For Redis backend
        if hasattr(cache.cache, '_write_client'):
            client = cache.cache._write_client
            keys = client.keys(f"{cache.cache.key_prefix}{pattern}*")
            if keys:
                client.delete(*keys)
        return True
    except Exception:
        return False


# ============================================================================
# Cache Decorators
# ============================================================================

def cached_ticket(ttl=CACHE_TTL['ticket']):
    """Decorator to cache ticket retrieval."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(ticket_id, *args, **kwargs):
            cache_key = get_ticket_cache_key(ticket_id)
            
            # Try to get from cache
            cached = cache_get(cache_key)
            if cached is not None:
                return cached
            
            # Get from database
            result = func(ticket_id, *args, **kwargs)
            
            # Store in cache
            if result:
                cache_set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator


def cached_user(ttl=CACHE_TTL['user']):
    """Decorator to cache user data."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(user_id, *args, **kwargs):
            cache_key = get_user_cache_key(user_id)
            
            cached = cache_get(cache_key)
            if cached is not None:
                return cached
            
            result = func(user_id, *args, **kwargs)
            
            if result:
                cache_set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator


def cached_dashboard(ttl=CACHE_TTL['dashboard']):
    """Decorator to cache dashboard metrics."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = get_dashboard_cache_key()
            
            cached = cache_get(cache_key)
            if cached is not None:
                return cached
            
            result = func(*args, **kwargs)
            
            if result:
                cache_set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator


# ============================================================================
# Cache Invalidation
# ============================================================================

def invalidate_ticket_cache(ticket_id):
    """Invalidate cache for a specific ticket."""
    cache_delete(get_ticket_cache_key(ticket_id))
    # Also invalidate list caches
    cache_delete_pattern(CACHE_PREFIX['tickets_list'])


def invalidate_user_cache(user_id):
    """Invalidate cache for a specific user."""
    cache_delete(get_user_cache_key(user_id))


def invalidate_dashboard_cache():
    """Invalidate dashboard metrics cache."""
    cache_delete(get_dashboard_cache_key())
    cache_delete_pattern(CACHE_PREFIX['agent_stats'])
    cache_delete_pattern(CACHE_PREFIX['sla_metrics'])


def invalidate_all_caches():
    """Invalidate all caches (use sparingly)."""
    try:
        cache.clear()
        return True
    except Exception:
        return False


# ============================================================================
# Query Result Caching
# ============================================================================

class CachedQuery:
    """Helper class for caching query results."""
    
    def __init__(self, cache_key, ttl=300):
        self.cache_key = cache_key
        self.ttl = ttl
    
    def get_or_set(self, query_func):
        """Get from cache or execute query and cache result."""
        cached = cache_get(self.cache_key)
        if cached is not None:
            return cached
        
        result = query_func()
        cache_set(self.cache_key, result, self.ttl)
        return result


def cache_query_result(key, ttl=300):
    """Decorator for caching query results."""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Build cache key from function name and args
            cache_key = f"{key}:{make_cache_key(*args, **kwargs)}"
            
            cached = cache_get(cache_key)
            if cached is not None:
                return cached
            
            result = func(*args, **kwargs)
            cache_set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator


