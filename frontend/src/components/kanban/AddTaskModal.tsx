import { useState, useEffect, useRef } from 'react';
import type { Task, Priority, ColumnId, Assignee } from '../../types/kanban';
import { priorityConfig, sampleAssignees } from '../../types/kanban';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  initialColumnId?: ColumnId;
  editTask?: Task | null;
}

export function AddTaskModal({ isOpen, onClose, onSave, initialColumnId = 'todo', editTask }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<Assignee[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [columnId, setColumnId] = useState<ColumnId>(initialColumnId);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  
  // Track if form has been initialized for current edit session
  const formInitialized = useRef(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setSelectedAssignees([]);
    setTags([]);
    setTagInput('');
  };

  // Populate form when modal opens or editTask changes
  useEffect(() => {
    if (!isOpen) {
      formInitialized.current = false;
      return;
    }
    
    if (formInitialized.current) return;
    formInitialized.current = true;
    
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || '');
      setPriority(editTask.priority);
      setDueDate(editTask.dueDate || '');
      setSelectedAssignees(editTask.assignees);
      setTags(editTask.tags || []);
      setColumnId(editTask.columnId);
    } else {
      resetForm();
      setColumnId(initialColumnId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editTask]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      assignees: selectedAssignees,
      tags: tags.length > 0 ? tags : undefined,
      columnId,
    });

    resetForm();
    onClose();
  };

  const toggleAssignee = (assignee: Assignee) => {
    if (selectedAssignees.find(a => a.id === assignee.id)) {
      setSelectedAssignees(selectedAssignees.filter(a => a.id !== assignee.id));
    } else {
      setSelectedAssignees([...selectedAssignees, assignee]);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl
                      max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
              {editTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                        hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="task-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600
                          bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                          placeholder:text-slate-400 dark:placeholder:text-slate-500
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                          transition-all"
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="task-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600
                          bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                          placeholder:text-slate-400 dark:placeholder:text-slate-500
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                          resize-none transition-all"
              />
            </div>

            {/* Priority & Status Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label htmlFor="task-priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Priority
                </label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600
                            bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                            transition-all"
                >
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              {/* Column/Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  value={columnId}
                  onChange={(e) => setColumnId(e.target.value as ColumnId)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600
                            bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                            transition-all"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600
                          bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                          transition-all"
              />
            </div>

            {/* Assignees */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Assignees
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600
                            bg-white dark:bg-slate-900 text-left
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                            transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedAssignees.length === 0 ? (
                      <span className="text-slate-400 dark:text-slate-500">Select assignees...</span>
                    ) : (
                      selectedAssignees.map((assignee) => (
                        <span
                          key={assignee.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                    bg-indigo-100 dark:bg-indigo-900/30 
                                    text-indigo-700 dark:text-indigo-300 text-sm"
                        >
                          {assignee.name}
                        </span>
                      ))
                    )}
                  </div>
                  <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showAssigneeDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowAssigneeDropdown(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 z-20 
                                    bg-white dark:bg-slate-800 rounded-xl shadow-lg 
                                    border border-slate-200 dark:border-slate-700 py-1 max-h-48 overflow-y-auto">
                      {sampleAssignees.map((assignee) => (
                        <button
                          key={assignee.id}
                          type="button"
                          onClick={() => toggleAssignee(assignee)}
                          className="w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700
                                    flex items-center gap-3 transition-colors"
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center
                                          ${selectedAssignees.find(a => a.id === assignee.id)
                                            ? 'bg-indigo-600 border-indigo-600' 
                                            : 'border-slate-300 dark:border-slate-600'}`}>
                            {selectedAssignees.find(a => a.id === assignee.id) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          {assignee.avatar ? (
                            <img src={assignee.avatar} alt="" className="w-6 h-6 rounded-full" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 
                                            flex items-center justify-center text-white text-xs">
                              {assignee.initials}
                            </div>
                          )}
                          <span className="text-slate-900 dark:text-white text-sm">{assignee.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                              bg-slate-100 dark:bg-slate-700 
                              text-slate-700 dark:text-slate-300 text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600
                            bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                            placeholder:text-slate-400 dark:placeholder:text-slate-500
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                            text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700
                            text-slate-600 dark:text-slate-300 text-sm font-medium
                            hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 
                          flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 font-medium
                        hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600
                        hover:from-indigo-500 hover:to-violet-500
                        text-white font-medium shadow-lg shadow-indigo-500/25
                        hover:shadow-indigo-500/40 transition-all"
            >
              {editTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
