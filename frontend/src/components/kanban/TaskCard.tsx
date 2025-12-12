import { useState, useEffect, useCallback } from 'react';
import type { Task, Assignee } from '../../types/kanban';
import { priorityConfig } from '../../types/kanban';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, isDragging }: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const priority = priorityConfig[task.priority];

  // Close menu on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && showMenu) {
      setShowMenu(false);
    }
  }, [showMenu]);

  useEffect(() => {
    if (showMenu) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showMenu, handleKeyDown]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', isOverdue: true };
    if (diffDays === 0) return { text: 'Today', isOverdue: false };
    if (diffDays === 1) return { text: 'Tomorrow', isOverdue: false };
    if (diffDays <= 7) return { text: `${diffDays} days`, isOverdue: false };

    return {
      text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isOverdue: false,
    };
  };

  const AssigneeAvatar = ({ assignee, index }: { assignee: Assignee; index: number }) => (
    <div
      className={`relative w-7 h-7 rounded-full ring-2 ring-white dark:ring-slate-800 
                  ${index > 0 ? '-ml-2' : ''} transition-transform hover:scale-110 hover:z-10`}
      title={assignee.name}
    >
      {assignee.avatar ? (
        <img
          src={assignee.avatar}
          alt={assignee.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 
                        flex items-center justify-center text-white text-xs font-medium">
          {assignee.initials}
        </div>
      )}
    </div>
  );

  return (
    <article
      className={`group relative bg-white dark:bg-slate-800 rounded-xl p-4
                  shadow-sm hover:shadow-md dark:shadow-slate-900/30
                  border border-slate-200/50 dark:border-slate-700/50
                  transition-all duration-200 cursor-grab active:cursor-grabbing
                  ${isDragging ? 'opacity-50 rotate-2 scale-105 shadow-xl' : ''}
                  hover:border-slate-300 dark:hover:border-slate-600`}
      draggable="true"
      data-task-id={task.id}
      aria-label={`Task: ${task.title}, Priority: ${priority.label}`}
      role="listitem"
    >
      {/* Priority indicator line */}
      <div className={`absolute top-0 left-4 right-4 h-0.5 rounded-full ${priority.bgColor}`} />

      {/* Header with priority and menu */}
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium
                         ${priority.bgColor} ${priority.color}`}>
          {task.priority === 'urgent' && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {priority.label}
        </span>

        {/* Menu button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-md opacity-0 group-hover:opacity-100 
                      text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                      hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            aria-label={`Task options for ${task.title}`}
            aria-expanded={showMenu}
            aria-haspopup="menu"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
                aria-hidden="true"
              />
              <div 
                className="absolute right-0 top-6 z-20 w-36 py-1 bg-white dark:bg-slate-800 
                              rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 animate-scaleIn"
                role="menu"
                aria-label="Task actions"
              >
                <button
                  onClick={() => {
                    onEdit?.(task);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300
                            hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                  role="menuitem"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete?.(task.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-rose-600 dark:text-rose-400
                            hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2"
                  role="menuitem"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full 
                        bg-slate-100 dark:bg-slate-700 
                        text-slate-600 dark:text-slate-400"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs rounded-full 
                            bg-slate-100 dark:bg-slate-700 
                            text-slate-500 dark:text-slate-400">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer with assignees and due date */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        {/* Assignees */}
        <div className="flex items-center">
          {task.assignees.slice(0, 3).map((assignee, index) => (
            <AssigneeAvatar key={assignee.id} assignee={assignee} index={index} />
          ))}
          {task.assignees.length > 3 && (
            <div className="relative w-7 h-7 -ml-2 rounded-full bg-slate-200 dark:bg-slate-600
                            ring-2 ring-white dark:ring-slate-800
                            flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300">
              +{task.assignees.length - 3}
            </div>
          )}
        </div>

        {/* Due date */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 text-xs font-medium
                          ${formatDate(task.dueDate).isOverdue 
                            ? 'text-rose-500 dark:text-rose-400' 
                            : 'text-slate-500 dark:text-slate-400'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(task.dueDate).text}
          </div>
        )}
      </div>

      {/* Drag handle indicator */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-8 rounded-r-full
                      bg-slate-200 dark:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </article>
  );
}

