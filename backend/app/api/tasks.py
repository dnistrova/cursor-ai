"""Task routes."""
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from

from app.api import api_bp
from app.models import Task
from app.schemas import TaskSchema, TaskCreateSchema, TaskUpdateSchema
from app import db


@api_bp.route('/tasks', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Tasks'],
    'summary': 'Get all tasks',
    'description': 'Get all tasks for the current user',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'status',
            'in': 'query',
            'type': 'string',
            'enum': ['todo', 'in-progress', 'done']
        },
        {
            'name': 'priority',
            'in': 'query',
            'type': 'string',
            'enum': ['low', 'medium', 'high', 'urgent']
        },
        {
            'name': 'page',
            'in': 'query',
            'type': 'integer',
            'default': 1
        },
        {
            'name': 'per_page',
            'in': 'query',
            'type': 'integer',
            'default': 20
        }
    ],
    'responses': {
        200: {
            'description': 'List of tasks',
            'schema': {
                'type': 'object',
                'properties': {
                    'tasks': {'type': 'array', 'items': {'$ref': '#/definitions/Task'}},
                    'total': {'type': 'integer'},
                    'page': {'type': 'integer'},
                    'per_page': {'type': 'integer'}
                }
            }
        },
        401: {'description': 'Unauthorized'}
    }
})
def get_tasks():
    """Get all tasks for current user."""
    user_id = get_jwt_identity()
    
    # Build query
    query = Task.query.filter_by(user_id=user_id)
    
    # Apply filters
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)
    
    priority = request.args.get('priority')
    if priority:
        query = query.filter_by(priority=priority)
    
    # Order by created date
    query = query.order_by(Task.created_at.desc())
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    schema = TaskSchema(many=True)
    
    return jsonify({
        'tasks': schema.dump(pagination.items),
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    }), 200


@api_bp.route('/tasks/<int:task_id>', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Tasks'],
    'summary': 'Get task by ID',
    'description': 'Get a specific task by ID',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'task_id',
            'in': 'path',
            'type': 'integer',
            'required': True
        }
    ],
    'responses': {
        200: {
            'description': 'Task data',
            'schema': {'$ref': '#/definitions/Task'}
        },
        404: {'description': 'Task not found'}
    }
})
def get_task(task_id):
    """Get a task by ID."""
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first_or_404()
    
    return jsonify(TaskSchema().dump(task)), 200


@api_bp.route('/tasks', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Tasks'],
    'summary': 'Create task',
    'description': 'Create a new task',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'title': {'type': 'string'},
                    'description': {'type': 'string'},
                    'status': {'type': 'string', 'enum': ['todo', 'in-progress', 'done']},
                    'priority': {'type': 'string', 'enum': ['low', 'medium', 'high', 'urgent']},
                    'due_date': {'type': 'string', 'format': 'date-time'}
                },
                'required': ['title']
            }
        }
    ],
    'responses': {
        201: {
            'description': 'Task created',
            'schema': {'$ref': '#/definitions/Task'}
        },
        400: {'description': 'Validation error'}
    }
})
def create_task():
    """Create a new task."""
    user_id = get_jwt_identity()
    
    schema = TaskCreateSchema()
    errors = schema.validate(request.json)
    if errors:
        return jsonify({'error': 'validation_error', 'details': errors}), 400
    
    data = schema.load(request.json)
    
    task = Task(
        title=data['title'],
        description=data.get('description'),
        status=data.get('status', 'todo'),
        priority=data.get('priority', 'medium'),
        due_date=data.get('due_date'),
        user_id=user_id
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify(TaskSchema().dump(task)), 201


@api_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
@swag_from({
    'tags': ['Tasks'],
    'summary': 'Update task',
    'description': 'Update an existing task',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'task_id',
            'in': 'path',
            'type': 'integer',
            'required': True
        },
        {
            'name': 'body',
            'in': 'body',
            'schema': {
                'type': 'object',
                'properties': {
                    'title': {'type': 'string'},
                    'description': {'type': 'string'},
                    'status': {'type': 'string', 'enum': ['todo', 'in-progress', 'done']},
                    'priority': {'type': 'string', 'enum': ['low', 'medium', 'high', 'urgent']},
                    'due_date': {'type': 'string', 'format': 'date-time'}
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Task updated',
            'schema': {'$ref': '#/definitions/Task'}
        },
        400: {'description': 'Validation error'},
        404: {'description': 'Task not found'}
    }
})
def update_task(task_id):
    """Update a task."""
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first_or_404()
    
    schema = TaskUpdateSchema()
    errors = schema.validate(request.json)
    if errors:
        return jsonify({'error': 'validation_error', 'details': errors}), 400
    
    data = schema.load(request.json)
    
    # Update fields
    for key, value in data.items():
        if hasattr(task, key):
            setattr(task, key, value)
    
    db.session.commit()
    
    return jsonify(TaskSchema().dump(task)), 200


@api_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
@swag_from({
    'tags': ['Tasks'],
    'summary': 'Delete task',
    'description': 'Delete a task',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'task_id',
            'in': 'path',
            'type': 'integer',
            'required': True
        }
    ],
    'responses': {
        204: {'description': 'Task deleted'},
        404: {'description': 'Task not found'}
    }
})
def delete_task(task_id):
    """Delete a task."""
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first_or_404()
    
    db.session.delete(task)
    db.session.commit()
    
    return '', 204


@api_bp.route('/tasks/<int:task_id>/status', methods=['PATCH'])
@jwt_required()
@swag_from({
    'tags': ['Tasks'],
    'summary': 'Update task status',
    'description': 'Quick update for task status (for drag and drop)',
    'security': [{'Bearer': []}],
    'parameters': [
        {
            'name': 'task_id',
            'in': 'path',
            'type': 'integer',
            'required': True
        },
        {
            'name': 'body',
            'in': 'body',
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'enum': ['todo', 'in-progress', 'done']}
                },
                'required': ['status']
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Task status updated',
            'schema': {'$ref': '#/definitions/Task'}
        },
        400: {'description': 'Invalid status'},
        404: {'description': 'Task not found'}
    }
})
def update_task_status(task_id):
    """Update task status."""
    user_id = get_jwt_identity()
    task = Task.query.filter_by(id=task_id, user_id=user_id).first_or_404()
    
    status = request.json.get('status')
    if status not in ['todo', 'in-progress', 'done']:
        return jsonify({'error': 'Invalid status'}), 400
    
    task.status = status
    db.session.commit()
    
    return jsonify(TaskSchema().dump(task)), 200



