"""Test factories for creating test data."""
import factory
from factory.alchemy import SQLAlchemyModelFactory
from datetime import datetime, timedelta
from app import db
from app.models.user import User
from app.models.blog import BlogPost, BlogComment, Category, Tag


class BaseFactory(SQLAlchemyModelFactory):
    """Base factory with session configuration."""
    
    class Meta:
        abstract = True
        sqlalchemy_session = None  # Set in conftest.py
        sqlalchemy_session_persistence = 'commit'


class UserFactory(BaseFactory):
    """Factory for creating test users."""
    
    class Meta:
        model = User
    
    email = factory.Sequence(lambda n: f'user{n}@example.com')
    username = factory.Sequence(lambda n: f'user{n}')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    is_active = True
    role = 'customer'
    
    @factory.lazy_attribute
    def password_hash(self):
        from werkzeug.security import generate_password_hash
        return generate_password_hash('TestPassword123')


class AdminFactory(UserFactory):
    """Factory for creating admin users."""
    
    role = 'admin'
    email = factory.Sequence(lambda n: f'admin{n}@example.com')
    username = factory.Sequence(lambda n: f'admin{n}')


class CategoryFactory(BaseFactory):
    """Factory for creating blog categories."""
    
    class Meta:
        model = Category
    
    name = factory.Sequence(lambda n: f'Category {n}')
    slug = factory.LazyAttribute(lambda o: o.name.lower().replace(' ', '-'))
    description = factory.Faker('sentence')


class TagFactory(BaseFactory):
    """Factory for creating blog tags."""
    
    class Meta:
        model = Tag
    
    name = factory.Sequence(lambda n: f'tag{n}')
    slug = factory.LazyAttribute(lambda o: o.name.lower())


class BlogPostFactory(BaseFactory):
    """Factory for creating blog posts."""
    
    class Meta:
        model = BlogPost
    
    title = factory.Faker('sentence', nb_words=6)
    slug = factory.LazyAttribute(lambda o: o.title.lower().replace(' ', '-').replace('.', ''))
    content = factory.Faker('paragraphs', nb=5, ext_word_list=None)
    excerpt = factory.Faker('paragraph')
    status = 'published'
    view_count = factory.Faker('random_int', min=0, max=1000)
    published_at = factory.LazyFunction(datetime.utcnow)
    
    author = factory.SubFactory(UserFactory)
    category = factory.SubFactory(CategoryFactory)
    
    @factory.lazy_attribute
    def content(self):
        from faker import Faker
        fake = Faker()
        return '\n\n'.join(fake.paragraphs(nb=5))


class DraftPostFactory(BlogPostFactory):
    """Factory for creating draft posts."""
    
    status = 'draft'
    published_at = None


class BlogCommentFactory(BaseFactory):
    """Factory for creating blog comments."""
    
    class Meta:
        model = BlogComment
    
    content = factory.Faker('paragraph')
    status = 'approved'
    
    post = factory.SubFactory(BlogPostFactory)
    author = factory.SubFactory(UserFactory)


