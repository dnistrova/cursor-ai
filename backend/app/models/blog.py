"""Blog models for the blogging platform."""
from datetime import datetime
from slugify import slugify
from app import db


# Association table for post tags
post_tags = db.Table(
    'post_tags',
    db.Column('post_id', db.Integer, db.ForeignKey('blog_posts.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('blog_tags.id'), primary_key=True)
)


class Category(db.Model):
    """Blog category model."""
    
    __tablename__ = 'blog_categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    slug = db.Column(db.String(60), unique=True, nullable=False, index=True)
    description = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    posts = db.relationship('BlogPost', backref='category', lazy='dynamic')
    
    def __repr__(self):
        return f'<Category {self.name}>'
    
    @staticmethod
    def create_slug(name):
        """Generate URL-friendly slug from name."""
        return slugify(name)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'post_count': self.posts.count(),
        }


class Tag(db.Model):
    """Blog tag model."""
    
    __tablename__ = 'blog_tags'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), unique=True, nullable=False)
    slug = db.Column(db.String(40), unique=True, nullable=False, index=True)
    
    def __repr__(self):
        return f'<Tag {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
        }


class BlogPost(db.Model):
    """Blog post model."""
    
    __tablename__ = 'blog_posts'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(220), unique=True, nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.String(500))
    featured_image = db.Column(db.String(255))
    
    # Status: draft, published, archived
    status = db.Column(db.String(20), default='draft', index=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = db.Column(db.DateTime, index=True)
    
    # Metrics
    view_count = db.Column(db.Integer, default=0)
    
    # Foreign keys
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    category_id = db.Column(db.Integer, db.ForeignKey('blog_categories.id'), index=True)
    
    # Relationships
    author = db.relationship('User', backref=db.backref('blog_posts', lazy='dynamic'))
    tags = db.relationship('Tag', secondary=post_tags, backref=db.backref('posts', lazy='dynamic'))
    comments = db.relationship('BlogComment', backref='post', lazy='dynamic', cascade='all, delete-orphan')
    
    # Indexes for search and filtering
    __table_args__ = (
        db.Index('idx_post_status_published', 'status', 'published_at'),
        db.Index('idx_post_author_status', 'author_id', 'status'),
    )
    
    def __repr__(self):
        return f'<BlogPost {self.title}>'
    
    @staticmethod
    def generate_slug(title):
        """Generate unique slug from title."""
        base_slug = slugify(title)
        slug = base_slug
        counter = 1
        while BlogPost.query.filter_by(slug=slug).first():
            slug = f'{base_slug}-{counter}'
            counter += 1
        return slug
    
    def publish(self):
        """Publish the post."""
        self.status = 'published'
        self.published_at = datetime.utcnow()
    
    def increment_views(self):
        """Increment view count."""
        self.view_count += 1
    
    def to_dict(self, include_content=True):
        """Convert post to dictionary."""
        data = {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'excerpt': self.excerpt,
            'featured_image': self.featured_image,
            'status': self.status,
            'view_count': self.view_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'author': {
                'id': self.author.id,
                'username': self.author.username,
                'full_name': self.author.full_name,
            } if self.author else None,
            'category': self.category.to_dict() if self.category else None,
            'tags': [tag.to_dict() for tag in self.tags],
            'comment_count': self.comments.count(),
        }
        
        if include_content:
            data['content'] = self.content
        
        return data


class BlogComment(db.Model):
    """Blog comment model."""
    
    __tablename__ = 'blog_comments'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    
    # Status: pending, approved, spam
    status = db.Column(db.String(20), default='approved', index=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    post_id = db.Column(db.Integer, db.ForeignKey('blog_posts.id'), nullable=False, index=True)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('blog_comments.id'))
    
    # Relationships
    author = db.relationship('User', backref='blog_comments')
    replies = db.relationship('BlogComment', backref=db.backref('parent', remote_side=[id]), lazy='dynamic')
    
    def __repr__(self):
        return f'<BlogComment {self.id} on Post {self.post_id}>'
    
    def to_dict(self, include_replies=False):
        """Convert comment to dictionary."""
        data = {
            'id': self.id,
            'content': self.content,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'post_id': self.post_id,
            'parent_id': self.parent_id,
            'author': {
                'id': self.author.id,
                'username': self.author.username,
                'full_name': self.author.full_name,
                'avatar_url': self.author.avatar_url,
            } if self.author else None,
            'reply_count': self.replies.count(),
        }
        
        if include_replies:
            data['replies'] = [r.to_dict() for r in self.replies.filter_by(status='approved').all()]
        
        return data


