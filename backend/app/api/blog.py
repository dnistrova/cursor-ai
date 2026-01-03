"""Blog API routes."""
from flask import request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity, jwt_required
from flasgger import swag_from
from sqlalchemy import or_

from app.api import api_bp
from app.models.user import User
from app.models.blog import BlogPost, BlogComment, Category, Tag
from app.schemas.blog import (
    BlogPostSchema, BlogPostCreateSchema, BlogPostUpdateSchema,
    BlogCommentSchema, BlogCommentCreateSchema,
    CategorySchema, CategoryCreateSchema,
    PostSearchSchema, PostListSchema
)
from app import db
from app.cache import (
    cache_get, cache_set, cache_delete,
    invalidate_ticket_cache as invalidate_post_cache,
    CACHE_TTL
)


def error_response(message, code, details=None, status_code=400):
    """Create standardized error response."""
    response = {'status': 'error', 'message': message, 'code': code}
    if details:
        response['errors'] = details
    return jsonify(response), status_code


# ============================================================================
# POSTS
# ============================================================================

@api_bp.route('/posts', methods=['GET'])
@swag_from({
    'tags': ['Blog Posts'],
    'summary': 'List blog posts',
    'description': 'Get paginated list of published blog posts',
    'parameters': [
        {'name': 'page', 'in': 'query', 'type': 'integer', 'default': 1},
        {'name': 'per_page', 'in': 'query', 'type': 'integer', 'default': 20},
        {'name': 'category', 'in': 'query', 'type': 'string'},
        {'name': 'tag', 'in': 'query', 'type': 'string'},
        {'name': 'sort_by', 'in': 'query', 'type': 'string', 'enum': ['published_at', 'view_count', 'title']},
    ],
    'responses': {
        200: {'description': 'List of posts'}
    }
})
def list_posts():
    """List published blog posts with pagination."""
    # Check cache first
    cache_key = f"posts:list:{request.query_string.decode()}"
    cached = cache_get(cache_key)
    if cached:
        return jsonify(cached), 200
    
    # Parse parameters
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 50)
    
    # Build query - only published posts
    query = BlogPost.query.filter_by(status='published')
    
    # Filter by category
    category_slug = request.args.get('category')
    if category_slug:
        category = Category.query.filter_by(slug=category_slug).first()
        if category:
            query = query.filter_by(category_id=category.id)
    
    # Filter by tag
    tag_slug = request.args.get('tag')
    if tag_slug:
        tag = Tag.query.filter_by(slug=tag_slug).first()
        if tag:
            query = query.filter(BlogPost.tags.contains(tag))
    
    # Sorting
    sort_by = request.args.get('sort_by', 'published_at')
    sort_order = request.args.get('sort_order', 'desc')
    
    if hasattr(BlogPost, sort_by):
        sort_column = getattr(BlogPost, sort_by)
        if sort_order == 'desc':
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
    
    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    result = {
        'status': 'success',
        'data': {
            'posts': [p.to_dict(include_content=False) for p in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev,
        }
    }
    
    # Cache for 1 minute
    cache_set(cache_key, result, ttl=60)
    
    return jsonify(result), 200


@api_bp.route('/posts/<int:post_id>', methods=['GET'])
@swag_from({
    'tags': ['Blog Posts'],
    'summary': 'Get a blog post',
    'parameters': [
        {'name': 'post_id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        200: {'description': 'Post details'},
        404: {'description': 'Post not found'}
    }
})
def get_post(post_id):
    """Get a single blog post by ID."""
    # Check cache
    cache_key = f"post:{post_id}"
    cached = cache_get(cache_key)
    if cached:
        return jsonify(cached), 200
    
    post = BlogPost.query.get(post_id)
    if not post:
        return error_response('Post not found', 'NOT_FOUND', status_code=404)
    
    # Only show published posts to public
    if post.status != 'published':
        return error_response('Post not found', 'NOT_FOUND', status_code=404)
    
    # Increment view count
    post.increment_views()
    db.session.commit()
    
    result = {
        'status': 'success',
        'data': post.to_dict()
    }
    
    # Cache for 5 minutes
    cache_set(cache_key, result, ttl=300)
    
    return jsonify(result), 200


@api_bp.route('/posts/<slug>', methods=['GET'])
@swag_from({
    'tags': ['Blog Posts'],
    'summary': 'Get a blog post by slug',
    'parameters': [
        {'name': 'slug', 'in': 'path', 'type': 'string', 'required': True}
    ],
    'responses': {
        200: {'description': 'Post details'},
        404: {'description': 'Post not found'}
    }
})
def get_post_by_slug(slug):
    """Get a single blog post by slug."""
    # Check if slug is numeric (post_id)
    if slug.isdigit():
        return get_post(int(slug))
    
    cache_key = f"post:slug:{slug}"
    cached = cache_get(cache_key)
    if cached:
        return jsonify(cached), 200
    
    post = BlogPost.query.filter_by(slug=slug, status='published').first()
    if not post:
        return error_response('Post not found', 'NOT_FOUND', status_code=404)
    
    post.increment_views()
    db.session.commit()
    
    result = {
        'status': 'success',
        'data': post.to_dict()
    }
    
    cache_set(cache_key, result, ttl=300)
    
    return jsonify(result), 200


@api_bp.route('/posts', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Blog Posts'],
    'summary': 'Create a blog post',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'title': {'type': 'string', 'minLength': 5, 'maxLength': 200},
                    'content': {'type': 'string', 'minLength': 50},
                    'excerpt': {'type': 'string', 'maxLength': 500},
                    'featured_image': {'type': 'string', 'format': 'uri'},
                    'category_id': {'type': 'integer'},
                    'tag_ids': {'type': 'array', 'items': {'type': 'integer'}},
                    'status': {'type': 'string', 'enum': ['draft', 'published']}
                },
                'required': ['title', 'content']
            }
        }
    ],
    'responses': {
        201: {'description': 'Post created'},
        400: {'description': 'Validation error'},
        401: {'description': 'Unauthorized'}
    }
})
def create_post():
    """Create a new blog post."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return error_response('User not found', 'UNAUTHORIZED', status_code=401)
    
    schema = BlogPostCreateSchema()
    errors = schema.validate(request.json or {})
    if errors:
        return error_response('Validation failed', 'VALIDATION_ERROR', details=errors)
    
    data = schema.load(request.json)
    
    # Create post
    post = BlogPost(
        title=data['title'],
        slug=BlogPost.generate_slug(data['title']),
        content=data['content'],
        excerpt=data.get('excerpt', data['content'][:200] + '...'),
        featured_image=data.get('featured_image'),
        status=data.get('status', 'draft'),
        author_id=user.id,
        category_id=data.get('category_id'),
    )
    
    # Publish if status is published
    if post.status == 'published':
        post.publish()
    
    # Add tags
    if data.get('tag_ids'):
        tags = Tag.query.filter(Tag.id.in_(data['tag_ids'])).all()
        post.tags = tags
    
    db.session.add(post)
    db.session.commit()
    
    # Invalidate list cache
    cache_delete('posts:list:')
    
    return jsonify({
        'status': 'success',
        'message': 'Post created successfully',
        'data': post.to_dict()
    }), 201


@api_bp.route('/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
@swag_from({
    'tags': ['Blog Posts'],
    'summary': 'Update a blog post',
    'security': [{'Bearer': []}],
    'responses': {
        200: {'description': 'Post updated'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def update_post(post_id):
    """Update a blog post."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    post = BlogPost.query.get(post_id)
    if not post:
        return error_response('Post not found', 'NOT_FOUND', status_code=404)
    
    # Only author or admin can update
    if post.author_id != user.id and not user.is_admin:
        return error_response('Forbidden', 'FORBIDDEN', status_code=403)
    
    schema = BlogPostUpdateSchema()
    errors = schema.validate(request.json or {})
    if errors:
        return error_response('Validation failed', 'VALIDATION_ERROR', details=errors)
    
    data = schema.load(request.json)
    
    # Update fields
    if 'title' in data:
        post.title = data['title']
        # Regenerate slug if title changed
        post.slug = BlogPost.generate_slug(data['title'])
    
    if 'content' in data:
        post.content = data['content']
    
    if 'excerpt' in data:
        post.excerpt = data['excerpt']
    
    if 'featured_image' in data:
        post.featured_image = data['featured_image']
    
    if 'category_id' in data:
        post.category_id = data['category_id']
    
    if 'status' in data:
        old_status = post.status
        post.status = data['status']
        if data['status'] == 'published' and old_status != 'published':
            post.publish()
    
    if 'tag_ids' in data:
        tags = Tag.query.filter(Tag.id.in_(data['tag_ids'])).all()
        post.tags = tags
    
    db.session.commit()
    
    # Invalidate caches
    cache_delete(f"post:{post_id}")
    cache_delete(f"post:slug:{post.slug}")
    
    return jsonify({
        'status': 'success',
        'message': 'Post updated successfully',
        'data': post.to_dict()
    }), 200


@api_bp.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
@swag_from({
    'tags': ['Blog Posts'],
    'summary': 'Delete a blog post',
    'security': [{'Bearer': []}],
    'responses': {
        204: {'description': 'Post deleted'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def delete_post(post_id):
    """Delete a blog post."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    post = BlogPost.query.get(post_id)
    if not post:
        return error_response('Post not found', 'NOT_FOUND', status_code=404)
    
    if post.author_id != user.id and not user.is_admin:
        return error_response('Forbidden', 'FORBIDDEN', status_code=403)
    
    slug = post.slug
    db.session.delete(post)
    db.session.commit()
    
    # Invalidate caches
    cache_delete(f"post:{post_id}")
    cache_delete(f"post:slug:{slug}")
    
    return '', 204


# ============================================================================
# COMMENTS
# ============================================================================

@api_bp.route('/posts/<int:post_id>/comments', methods=['GET'])
@swag_from({
    'tags': ['Comments'],
    'summary': 'Get post comments',
    'parameters': [
        {'name': 'post_id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        200: {'description': 'List of comments'},
        404: {'description': 'Post not found'}
    }
})
def get_post_comments(post_id):
    """Get all comments for a post."""
    post = BlogPost.query.get(post_id)
    if not post:
        return error_response('Post not found', 'NOT_FOUND', status_code=404)
    
    # Get top-level comments only (approved)
    comments = post.comments.filter_by(
        parent_id=None,
        status='approved'
    ).order_by(BlogComment.created_at.desc()).all()
    
    return jsonify({
        'status': 'success',
        'data': {
            'comments': [c.to_dict(include_replies=True) for c in comments],
            'total': len(comments)
        }
    }), 200


@api_bp.route('/posts/<int:post_id>/comments', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Comments'],
    'summary': 'Add a comment to a post',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'post_id', 'in': 'path', 'type': 'integer', 'required': True},
        {
            'name': 'body',
            'in': 'body',
            'schema': {
                'type': 'object',
                'properties': {
                    'content': {'type': 'string', 'minLength': 3, 'maxLength': 2000},
                    'parent_id': {'type': 'integer'}
                },
                'required': ['content']
            }
        }
    ],
    'responses': {
        201: {'description': 'Comment created'},
        400: {'description': 'Validation error'},
        404: {'description': 'Post not found'}
    }
})
def create_comment(post_id):
    """Create a new comment on a post."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    post = BlogPost.query.get(post_id)
    if not post or post.status != 'published':
        return error_response('Post not found', 'NOT_FOUND', status_code=404)
    
    schema = BlogCommentCreateSchema()
    errors = schema.validate(request.json or {})
    if errors:
        return error_response('Validation failed', 'VALIDATION_ERROR', details=errors)
    
    data = schema.load(request.json)
    
    # Validate parent comment if provided
    if data.get('parent_id'):
        parent = BlogComment.query.filter_by(
            id=data['parent_id'],
            post_id=post_id
        ).first()
        if not parent:
            return error_response('Parent comment not found', 'VALIDATION_ERROR')
    
    comment = BlogComment(
        content=data['content'],
        post_id=post_id,
        author_id=user.id,
        parent_id=data.get('parent_id'),
        status='approved'  # Auto-approve for logged-in users
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'message': 'Comment added successfully',
        'data': comment.to_dict()
    }), 201


@api_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
@swag_from({
    'tags': ['Comments'],
    'summary': 'Delete a comment',
    'security': [{'Bearer': []}],
    'responses': {
        204: {'description': 'Comment deleted'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def delete_comment(comment_id):
    """Delete a comment."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    comment = BlogComment.query.get(comment_id)
    if not comment:
        return error_response('Comment not found', 'NOT_FOUND', status_code=404)
    
    # Only author, post author, or admin can delete
    if comment.author_id != user.id and comment.post.author_id != user.id and not user.is_admin:
        return error_response('Forbidden', 'FORBIDDEN', status_code=403)
    
    db.session.delete(comment)
    db.session.commit()
    
    return '', 204


# ============================================================================
# CATEGORIES
# ============================================================================

@api_bp.route('/categories', methods=['GET'])
@swag_from({
    'tags': ['Categories'],
    'summary': 'List all categories',
    'responses': {
        200: {'description': 'List of categories'}
    }
})
def list_categories():
    """List all blog categories."""
    cache_key = 'categories:all'
    cached = cache_get(cache_key)
    if cached:
        return jsonify(cached), 200
    
    categories = Category.query.order_by(Category.name).all()
    
    result = {
        'status': 'success',
        'data': {
            'categories': [c.to_dict() for c in categories],
            'total': len(categories)
        }
    }
    
    cache_set(cache_key, result, ttl=600)  # Cache for 10 minutes
    
    return jsonify(result), 200


@api_bp.route('/categories', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Categories'],
    'summary': 'Create a category',
    'security': [{'Bearer': []}],
    'responses': {
        201: {'description': 'Category created'},
        400: {'description': 'Validation error'},
        409: {'description': 'Category already exists'}
    }
})
def create_category():
    """Create a new category (admin only)."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user.is_admin:
        return error_response('Admin access required', 'FORBIDDEN', status_code=403)
    
    schema = CategoryCreateSchema()
    errors = schema.validate(request.json or {})
    if errors:
        return error_response('Validation failed', 'VALIDATION_ERROR', details=errors)
    
    data = schema.load(request.json)
    
    # Check for duplicate
    if Category.query.filter_by(name=data['name']).first():
        return error_response('Category already exists', 'CONFLICT', status_code=409)
    
    category = Category(
        name=data['name'],
        slug=Category.create_slug(data['name']),
        description=data.get('description')
    )
    
    db.session.add(category)
    db.session.commit()
    
    cache_delete('categories:all')
    
    return jsonify({
        'status': 'success',
        'message': 'Category created',
        'data': category.to_dict()
    }), 201


# ============================================================================
# SEARCH
# ============================================================================

@api_bp.route('/search', methods=['GET'])
@swag_from({
    'tags': ['Search'],
    'summary': 'Search posts',
    'parameters': [
        {'name': 'q', 'in': 'query', 'type': 'string', 'required': True, 'description': 'Search keyword'},
        {'name': 'category', 'in': 'query', 'type': 'string'},
        {'name': 'tag', 'in': 'query', 'type': 'string'},
        {'name': 'page', 'in': 'query', 'type': 'integer', 'default': 1},
        {'name': 'per_page', 'in': 'query', 'type': 'integer', 'default': 20},
    ],
    'responses': {
        200: {'description': 'Search results'},
        400: {'description': 'Missing search query'}
    }
})
def search_posts():
    """Search posts by keyword."""
    keyword = request.args.get('q', '').strip()
    
    if not keyword or len(keyword) < 2:
        return error_response('Search query must be at least 2 characters', 'VALIDATION_ERROR')
    
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 50)
    
    # Search in title and content
    query = BlogPost.query.filter(
        BlogPost.status == 'published',
        or_(
            BlogPost.title.ilike(f'%{keyword}%'),
            BlogPost.content.ilike(f'%{keyword}%'),
            BlogPost.excerpt.ilike(f'%{keyword}%')
        )
    )
    
    # Filter by category
    category_slug = request.args.get('category')
    if category_slug:
        category = Category.query.filter_by(slug=category_slug).first()
        if category:
            query = query.filter_by(category_id=category.id)
    
    # Filter by tag
    tag_slug = request.args.get('tag')
    if tag_slug:
        tag = Tag.query.filter_by(slug=tag_slug).first()
        if tag:
            query = query.filter(BlogPost.tags.contains(tag))
    
    # Order by relevance (title matches first)
    query = query.order_by(
        BlogPost.title.ilike(f'%{keyword}%').desc(),
        BlogPost.published_at.desc()
    )
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'status': 'success',
        'data': {
            'query': keyword,
            'posts': [p.to_dict(include_content=False) for p in pagination.items],
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'pages': pagination.pages,
        }
    }), 200


