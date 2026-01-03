"""Blog schemas for validation and serialization."""
from marshmallow import Schema, fields, validate, validates, post_load
from marshmallow.exceptions import ValidationError


class CategorySchema(Schema):
    """Schema for category serialization."""
    
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    slug = fields.Str(dump_only=True)
    description = fields.Str(validate=validate.Length(max=200))
    post_count = fields.Int(dump_only=True)


class CategoryCreateSchema(Schema):
    """Schema for creating a category."""
    
    name = fields.Str(required=True, validate=validate.Length(min=2, max=50))
    description = fields.Str(validate=validate.Length(max=200))


class TagSchema(Schema):
    """Schema for tag serialization."""
    
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=2, max=30))
    slug = fields.Str(dump_only=True)


class BlogPostSchema(Schema):
    """Schema for blog post serialization."""
    
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=5, max=200))
    slug = fields.Str(dump_only=True)
    content = fields.Str(required=True, validate=validate.Length(min=50))
    excerpt = fields.Str(validate=validate.Length(max=500))
    featured_image = fields.Url(allow_none=True)
    status = fields.Str(dump_only=True)
    view_count = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    published_at = fields.DateTime(dump_only=True)
    author = fields.Dict(dump_only=True)
    category = fields.Nested(CategorySchema, dump_only=True)
    tags = fields.List(fields.Nested(TagSchema), dump_only=True)
    comment_count = fields.Int(dump_only=True)


class BlogPostCreateSchema(Schema):
    """Schema for creating a blog post."""
    
    title = fields.Str(required=True, validate=validate.Length(min=5, max=200))
    content = fields.Str(required=True, validate=validate.Length(min=50))
    excerpt = fields.Str(validate=validate.Length(max=500))
    featured_image = fields.Url(allow_none=True)
    category_id = fields.Int()
    tag_ids = fields.List(fields.Int(), load_default=[])
    status = fields.Str(
        validate=validate.OneOf(['draft', 'published']),
        load_default='draft'
    )
    
    @validates('title')
    def validate_title(self, value):
        """Validate title doesn't contain HTML."""
        if '<' in value or '>' in value:
            raise ValidationError('Title cannot contain HTML tags')


class BlogPostUpdateSchema(Schema):
    """Schema for updating a blog post."""
    
    title = fields.Str(validate=validate.Length(min=5, max=200))
    content = fields.Str(validate=validate.Length(min=50))
    excerpt = fields.Str(validate=validate.Length(max=500))
    featured_image = fields.Url(allow_none=True)
    category_id = fields.Int(allow_none=True)
    tag_ids = fields.List(fields.Int())
    status = fields.Str(validate=validate.OneOf(['draft', 'published', 'archived']))


class BlogCommentSchema(Schema):
    """Schema for blog comment serialization."""
    
    id = fields.Int(dump_only=True)
    content = fields.Str(required=True, validate=validate.Length(min=3, max=2000))
    status = fields.Str(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    post_id = fields.Int(dump_only=True)
    parent_id = fields.Int(allow_none=True)
    author = fields.Dict(dump_only=True)
    reply_count = fields.Int(dump_only=True)
    replies = fields.List(fields.Nested('BlogCommentSchema'), dump_only=True)


class BlogCommentCreateSchema(Schema):
    """Schema for creating a blog comment."""
    
    content = fields.Str(required=True, validate=validate.Length(min=3, max=2000))
    parent_id = fields.Int(allow_none=True)
    
    @validates('content')
    def validate_content(self, value):
        """Basic spam check."""
        spam_keywords = ['buy now', 'click here', 'free money']
        if any(kw in value.lower() for kw in spam_keywords):
            raise ValidationError('Comment appears to be spam')


class PostSearchSchema(Schema):
    """Schema for post search parameters."""
    
    q = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    category = fields.Str()
    tag = fields.Str()
    page = fields.Int(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Int(load_default=20, validate=validate.Range(min=1, max=50))


class PostListSchema(Schema):
    """Schema for post list parameters."""
    
    page = fields.Int(load_default=1, validate=validate.Range(min=1))
    per_page = fields.Int(load_default=20, validate=validate.Range(min=1, max=50))
    category = fields.Str()
    tag = fields.Str()
    author = fields.Int()
    status = fields.Str(validate=validate.OneOf(['draft', 'published', 'archived']))
    sort_by = fields.Str(
        load_default='published_at',
        validate=validate.OneOf(['published_at', 'created_at', 'view_count', 'title'])
    )
    sort_order = fields.Str(
        load_default='desc',
        validate=validate.OneOf(['asc', 'desc'])
    )


