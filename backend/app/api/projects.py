"""Project routes."""
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from

from app.api import api_bp
from app.models import Project, User
from app.schemas import ProjectSchema, ProjectCreateSchema, ProjectUpdateSchema, ProjectMemberSchema
from app import db


@api_bp.route('/projects', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Projects'],
    'summary': 'Get all projects',
    'description': 'Get all projects the user owns or is a member of',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'status', 'in': 'query', 'type': 'string', 'enum': ['active', 'archived', 'completed']},
        {'name': 'page', 'in': 'query', 'type': 'integer', 'default': 1},
        {'name': 'per_page', 'in': 'query', 'type': 'integer', 'default': 20}
    ],
    'responses': {
        200: {'description': 'List of projects'},
        401: {'description': 'Unauthorized'}
    }
})
def get_projects():
    """Get all projects for current user."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Get projects where user is owner or member
    query = Project.query.filter(
        db.or_(
            Project.owner_id == user_id,
            Project.members.any(id=user_id)
        )
    )
    
    # Apply filters
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)
    
    query = query.order_by(Project.updated_at.desc())
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    schema = ProjectSchema(many=True)
    
    return jsonify({
        'projects': schema.dump(pagination.items),
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    }), 200


@api_bp.route('/projects/<int:project_id>', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Projects'],
    'summary': 'Get project by ID',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'project_id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        200: {'description': 'Project data'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def get_project(project_id):
    """Get a project by ID."""
    user_id = get_jwt_identity()
    project = Project.query.get_or_404(project_id)
    
    # Check access
    user = User.query.get(user_id)
    if not project.is_member(user) and project.visibility == 'private':
        return jsonify({'error': 'Forbidden'}), 403
    
    return jsonify(ProjectSchema().dump(project)), 200


@api_bp.route('/projects', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Projects'],
    'summary': 'Create project',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'name': {'type': 'string'},
                    'description': {'type': 'string'},
                    'color': {'type': 'string'},
                    'visibility': {'type': 'string', 'enum': ['private', 'team', 'public']},
                    'member_ids': {'type': 'array', 'items': {'type': 'integer'}}
                },
                'required': ['name']
            }
        }
    ],
    'responses': {
        201: {'description': 'Project created'},
        400: {'description': 'Validation error'}
    }
})
def create_project():
    """Create a new project."""
    user_id = get_jwt_identity()
    
    schema = ProjectCreateSchema()
    errors = schema.validate(request.json)
    if errors:
        return jsonify({'error': 'validation_error', 'details': errors}), 400
    
    data = schema.load(request.json)
    
    project = Project(
        name=data['name'],
        description=data.get('description'),
        color=data.get('color', '#6366f1'),
        icon=data.get('icon', 'folder'),
        visibility=data.get('visibility', 'private'),
        start_date=data.get('start_date'),
        due_date=data.get('due_date'),
        owner_id=user_id
    )
    
    # Add members
    member_ids = data.get('member_ids', [])
    for member_id in member_ids:
        member = User.query.get(member_id)
        if member:
            project.add_member(member)
    
    db.session.add(project)
    db.session.commit()
    
    return jsonify(ProjectSchema().dump(project)), 201


@api_bp.route('/projects/<int:project_id>', methods=['PUT'])
@jwt_required()
@swag_from({
    'tags': ['Projects'],
    'summary': 'Update project',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'project_id', 'in': 'path', 'type': 'integer', 'required': True},
        {'name': 'body', 'in': 'body', 'schema': {'type': 'object'}}
    ],
    'responses': {
        200: {'description': 'Project updated'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def update_project(project_id):
    """Update a project."""
    user_id = get_jwt_identity()
    project = Project.query.get_or_404(project_id)
    
    # Only owner can update project
    if project.owner_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403
    
    schema = ProjectUpdateSchema()
    errors = schema.validate(request.json)
    if errors:
        return jsonify({'error': 'validation_error', 'details': errors}), 400
    
    data = schema.load(request.json)
    
    for key, value in data.items():
        if hasattr(project, key):
            setattr(project, key, value)
    
    db.session.commit()
    
    return jsonify(ProjectSchema().dump(project)), 200


@api_bp.route('/projects/<int:project_id>', methods=['DELETE'])
@jwt_required()
@swag_from({
    'tags': ['Projects'],
    'summary': 'Delete project',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'project_id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        204: {'description': 'Project deleted'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def delete_project(project_id):
    """Delete a project."""
    user_id = get_jwt_identity()
    project = Project.query.get_or_404(project_id)
    
    if project.owner_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403
    
    db.session.delete(project)
    db.session.commit()
    
    return '', 204


@api_bp.route('/projects/<int:project_id>/members', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Projects'],
    'summary': 'Add project member',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'project_id', 'in': 'path', 'type': 'integer', 'required': True},
        {
            'name': 'body',
            'in': 'body',
            'schema': {
                'type': 'object',
                'properties': {
                    'user_id': {'type': 'integer'},
                    'role': {'type': 'string', 'enum': ['admin', 'member']}
                },
                'required': ['user_id']
            }
        }
    ],
    'responses': {
        200: {'description': 'Member added'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def add_project_member(project_id):
    """Add a member to the project."""
    user_id = get_jwt_identity()
    project = Project.query.get_or_404(project_id)
    
    if project.owner_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403
    
    schema = ProjectMemberSchema()
    errors = schema.validate(request.json)
    if errors:
        return jsonify({'error': 'validation_error', 'details': errors}), 400
    
    data = schema.load(request.json)
    
    new_member = User.query.get_or_404(data['user_id'])
    project.add_member(new_member, data.get('role', 'member'))
    
    db.session.commit()
    
    return jsonify(ProjectSchema().dump(project)), 200


@api_bp.route('/projects/<int:project_id>/members/<int:member_id>', methods=['DELETE'])
@jwt_required()
@swag_from({
    'tags': ['Projects'],
    'summary': 'Remove project member',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'project_id', 'in': 'path', 'type': 'integer', 'required': True},
        {'name': 'member_id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        200: {'description': 'Member removed'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def remove_project_member(project_id, member_id):
    """Remove a member from the project."""
    user_id = get_jwt_identity()
    project = Project.query.get_or_404(project_id)
    
    if project.owner_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403
    
    member = User.query.get_or_404(member_id)
    project.remove_member(member)
    
    db.session.commit()
    
    return jsonify(ProjectSchema().dump(project)), 200


@api_bp.route('/projects/<int:project_id>/tasks', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Projects'],
    'summary': 'Get project tasks',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'project_id', 'in': 'path', 'type': 'integer', 'required': True},
        {'name': 'status', 'in': 'query', 'type': 'string'},
        {'name': 'priority', 'in': 'query', 'type': 'string'}
    ],
    'responses': {
        200: {'description': 'List of tasks'},
        403: {'description': 'Forbidden'},
        404: {'description': 'Not found'}
    }
})
def get_project_tasks(project_id):
    """Get all tasks for a project."""
    from app.schemas import TaskSchema
    
    user_id = get_jwt_identity()
    project = Project.query.get_or_404(project_id)
    
    user = User.query.get(user_id)
    if not project.is_member(user) and project.visibility == 'private':
        return jsonify({'error': 'Forbidden'}), 403
    
    query = project.tasks
    
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)
    
    priority = request.args.get('priority')
    if priority:
        query = query.filter_by(priority=priority)
    
    tasks = query.order_by('position', 'created_at').all()
    
    return jsonify({
        'tasks': TaskSchema(many=True).dump(tasks),
        'total': len(tasks)
    }), 200



