"""Comprehensive tests for the Blog API - 20+ test cases for 85%+ coverage."""
import pytest
import json
from datetime import datetime, timedelta
from app.models.blog import BlogPost, BlogComment, Category, Tag
from app.models.user import User


class TestPostListEndpoint:
    """Tests for GET /api/v1/posts - List posts."""
    
    def test_list_posts_empty(self, client):
        """Test listing posts when database is empty."""
        response = client.get('/api/v1/posts')
        
        assert response.status_code == 200
        data = response.json
        assert data['status'] == 'success'
        assert data['data']['posts'] == []
        assert data['data']['total'] == 0
    
    def test_list_posts_with_data(self, client, published_posts):
        """Test listing posts returns published posts only."""
        response = client.get('/api/v1/posts')
        
        assert response.status_code == 200
        data = response.json
        assert data['status'] == 'success'
        assert len(data['data']['posts']) == 3
        assert data['data']['total'] == 3
        # Check all posts are published
        for post in data['data']['posts']:
            assert post['status'] == 'published'
    
    def test_list_posts_excludes_drafts(self, client, draft_post, published_posts):
        """Test that draft posts are not included in listing."""
        response = client.get('/api/v1/posts')
        
        assert response.status_code == 200
        # Should only have published posts
        assert response.json['data']['total'] == 3
    
    def test_list_posts_pagination(self, client, many_posts):
        """Test posts pagination with per_page parameter."""
        response = client.get('/api/v1/posts?page=1&per_page=5')
        
        assert response.status_code == 200
        data = response.json['data']
        assert len(data['posts']) == 5
        assert data['page'] == 1
        assert data['per_page'] == 5
        assert data['has_next'] == True
    
    def test_list_posts_filter_by_category(self, client, category, published_posts):
        """Test filtering posts by category."""
        response = client.get(f'/api/v1/posts?category={category.slug}')
        
        assert response.status_code == 200
        # All posts in our fixtures have the same category
        assert response.json['data']['total'] >= 1


class TestPostDetailEndpoint:
    """Tests for GET /api/v1/posts/<id> - Get single post."""
    
    def test_get_post_success(self, client, published_post):
        """Test getting a published post by ID."""
        response = client.get(f'/api/v1/posts/{published_post.id}')
        
        assert response.status_code == 200
        data = response.json
        assert data['status'] == 'success'
        assert data['data']['id'] == published_post.id
        assert data['data']['title'] == published_post.title
        assert 'content' in data['data']
    
    def test_get_post_not_found(self, client):
        """Test getting a non-existent post returns 404."""
        response = client.get('/api/v1/posts/99999')
        
        assert response.status_code == 404
        assert response.json['code'] == 'NOT_FOUND'
    
    def test_get_draft_post_returns_404(self, client, draft_post):
        """Test that draft posts return 404 for public access."""
        response = client.get(f'/api/v1/posts/{draft_post.id}')
        
        assert response.status_code == 404
    
    def test_get_post_increments_view_count(self, client, published_post, app):
        """Test that viewing a post increments its view count."""
        initial_views = published_post.view_count
        
        client.get(f'/api/v1/posts/{published_post.id}')
        
        with app.app_context():
            post = BlogPost.query.get(published_post.id)
            assert post.view_count == initial_views + 1


class TestPostCreateEndpoint:
    """Tests for POST /api/v1/posts - Create post."""
    
    def test_create_post_success(self, client, auth_headers):
        """Test creating a post with valid data."""
        post_data = {
            'title': 'Test Blog Post Title Here',
            'content': 'This is the content of the test blog post. It needs to be at least 50 characters long to pass validation.',
            'excerpt': 'Short excerpt',
            'status': 'draft'
        }
        
        response = client.post(
            '/api/v1/posts',
            json=post_data,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json
        assert data['status'] == 'success'
        assert data['data']['title'] == post_data['title']
        assert data['data']['status'] == 'draft'
        assert 'slug' in data['data']
    
    def test_create_post_publish_immediately(self, client, auth_headers):
        """Test creating a post with published status."""
        post_data = {
            'title': 'Published Post Title Here',
            'content': 'This is published content that needs to be long enough for validation to pass.',
            'status': 'published'
        }
        
        response = client.post(
            '/api/v1/posts',
            json=post_data,
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json['data']
        assert data['status'] == 'published'
        assert data['published_at'] is not None
    
    def test_create_post_unauthorized(self, client):
        """Test creating a post without authentication."""
        response = client.post('/api/v1/posts', json={
            'title': 'Test Title',
            'content': 'Test content'
        })
        
        assert response.status_code == 401
    
    def test_create_post_validation_error_short_title(self, client, auth_headers):
        """Test creating a post with too short title."""
        response = client.post(
            '/api/v1/posts',
            json={'title': 'Hi', 'content': 'x' * 100},
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert 'title' in response.json.get('errors', {})
    
    def test_create_post_validation_error_short_content(self, client, auth_headers):
        """Test creating a post with too short content."""
        response = client.post(
            '/api/v1/posts',
            json={'title': 'Valid Title Here', 'content': 'Too short'},
            headers=auth_headers
        )
        
        assert response.status_code == 400
        assert 'content' in response.json.get('errors', {})


class TestPostUpdateEndpoint:
    """Tests for PUT /api/v1/posts/<id> - Update post."""
    
    def test_update_post_success(self, client, auth_headers, user_post):
        """Test updating own post."""
        response = client.put(
            f'/api/v1/posts/{user_post.id}',
            json={'title': 'Updated Title For The Post'},
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert response.json['data']['title'] == 'Updated Title For The Post'
    
    def test_update_post_forbidden(self, client, auth_headers, published_post):
        """Test updating another user's post returns 403."""
        response = client.put(
            f'/api/v1/posts/{published_post.id}',
            json={'title': 'Hacked Title'},
            headers=auth_headers
        )
        
        assert response.status_code == 403
    
    def test_update_post_not_found(self, client, auth_headers):
        """Test updating non-existent post."""
        response = client.put(
            '/api/v1/posts/99999',
            json={'title': 'New Title'},
            headers=auth_headers
        )
        
        assert response.status_code == 404


class TestPostDeleteEndpoint:
    """Tests for DELETE /api/v1/posts/<id> - Delete post."""
    
    def test_delete_post_success(self, client, auth_headers, user_post, app):
        """Test deleting own post."""
        post_id = user_post.id
        
        response = client.delete(
            f'/api/v1/posts/{post_id}',
            headers=auth_headers
        )
        
        assert response.status_code == 204
        
        # Verify post is deleted
        with app.app_context():
            assert BlogPost.query.get(post_id) is None
    
    def test_delete_post_forbidden(self, client, auth_headers, published_post):
        """Test deleting another user's post returns 403."""
        response = client.delete(
            f'/api/v1/posts/{published_post.id}',
            headers=auth_headers
        )
        
        assert response.status_code == 403


class TestCommentEndpoints:
    """Tests for comment endpoints."""
    
    def test_get_comments_success(self, client, published_post, comments):
        """Test getting comments for a post."""
        response = client.get(f'/api/v1/posts/{published_post.id}/comments')
        
        assert response.status_code == 200
        data = response.json
        assert data['status'] == 'success'
        assert len(data['data']['comments']) >= 1
    
    def test_get_comments_empty(self, client, published_post):
        """Test getting comments when none exist."""
        response = client.get(f'/api/v1/posts/{published_post.id}/comments')
        
        assert response.status_code == 200
        assert response.json['data']['total'] == 0
    
    def test_create_comment_success(self, client, auth_headers, published_post):
        """Test creating a comment on a post."""
        response = client.post(
            f'/api/v1/posts/{published_post.id}/comments',
            json={'content': 'This is a great post!'},
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json
        assert data['status'] == 'success'
        assert data['data']['content'] == 'This is a great post!'
    
    def test_create_comment_unauthorized(self, client, published_post):
        """Test creating a comment without authentication."""
        response = client.post(
            f'/api/v1/posts/{published_post.id}/comments',
            json={'content': 'Anonymous comment'}
        )
        
        assert response.status_code == 401
    
    def test_create_comment_validation_error(self, client, auth_headers, published_post):
        """Test creating a comment with invalid content."""
        response = client.post(
            f'/api/v1/posts/{published_post.id}/comments',
            json={'content': 'Hi'},  # Too short
            headers=auth_headers
        )
        
        assert response.status_code == 400
    
    def test_delete_comment_success(self, client, auth_headers, user_comment):
        """Test deleting own comment."""
        response = client.delete(
            f'/api/v1/comments/{user_comment.id}',
            headers=auth_headers
        )
        
        assert response.status_code == 204


class TestCategoryEndpoints:
    """Tests for category endpoints."""
    
    def test_list_categories(self, client, categories):
        """Test listing all categories."""
        response = client.get('/api/v1/categories')
        
        assert response.status_code == 200
        data = response.json
        assert data['status'] == 'success'
        assert len(data['data']['categories']) >= 1
    
    def test_create_category_admin(self, client, admin_headers):
        """Test creating a category as admin."""
        response = client.post(
            '/api/v1/categories',
            json={'name': 'New Category', 'description': 'A new category'},
            headers=admin_headers
        )
        
        assert response.status_code == 201
        assert response.json['data']['name'] == 'New Category'
    
    def test_create_category_forbidden(self, client, auth_headers):
        """Test creating a category as non-admin."""
        response = client.post(
            '/api/v1/categories',
            json={'name': 'Forbidden Category'},
            headers=auth_headers
        )
        
        assert response.status_code == 403


class TestSearchEndpoint:
    """Tests for GET /api/v1/search - Search posts."""
    
    def test_search_posts_success(self, client, published_posts):
        """Test searching posts by keyword."""
        # Get a word from the first post's title
        response = client.get('/api/v1/search?q=test')
        
        assert response.status_code == 200
        data = response.json
        assert data['status'] == 'success'
        assert 'posts' in data['data']
    
    def test_search_posts_no_query(self, client):
        """Test search without query parameter."""
        response = client.get('/api/v1/search')
        
        assert response.status_code == 400
    
    def test_search_posts_short_query(self, client):
        """Test search with too short query."""
        response = client.get('/api/v1/search?q=a')
        
        assert response.status_code == 400
    
    def test_search_posts_pagination(self, client, many_posts):
        """Test search results pagination."""
        response = client.get('/api/v1/search?q=post&page=1&per_page=5')
        
        assert response.status_code == 200
        data = response.json['data']
        assert data['page'] == 1
        assert data['per_page'] == 5


class TestAuthentication:
    """Tests for authentication endpoints."""
    
    def test_register_success(self, client):
        """Test user registration."""
        response = client.post('/api/v1/auth/register', json={
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': 'SecurePass123!'
        })
        
        assert response.status_code == 201
        assert 'email' in response.json
    
    def test_register_duplicate_email(self, client, test_user):
        """Test registration with existing email."""
        response = client.post('/api/v1/auth/register', json={
            'email': test_user.email,
            'username': 'different',
            'password': 'SecurePass123!'
        })
        
        assert response.status_code == 409
    
    def test_login_success(self, client, test_user):
        """Test user login."""
        response = client.post('/api/v1/auth/login', json={
            'email': test_user.email,
            'password': 'TestPassword123'
        })
        
        assert response.status_code == 200
        assert 'access_token' in response.json
    
    def test_login_invalid_password(self, client, test_user):
        """Test login with wrong password."""
        response = client.post('/api/v1/auth/login', json={
            'email': test_user.email,
            'password': 'WrongPassword123'
        })
        
        assert response.status_code == 401


