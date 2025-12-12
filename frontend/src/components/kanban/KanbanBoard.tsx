import { useState, useEffect, useCallback } from 'react';
import type { Task, ColumnId } from '../../types/kanban';
import { sampleTasks, columnConfig } from '../../types/kanban';
import { BoardColumn } from './BoardColumn';
import { AddTaskModal } from './AddTaskModal';

const STORAGE_KEY = 'kanban-board-tasks';

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Load from localStorage or use sample data
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return sampleTasks;
      }
    }
    return sampleTasks;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<ColumnId>('todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dropTargetColumn, setDropTargetColumn] = useState<ColumnId | null>(null);

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  // Group tasks by column
  const getColumnTasks = useCallback((columnId: ColumnId) => {
    return filteredTasks.filter(task => task.columnId === columnId);
  }, [filteredTasks]);

  // Add new task
  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks(prev => [...prev, newTask]);
  };

  // Edit task
  const handleEditTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!editingTask) return;
    setTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? { ...task, ...taskData }
        : task
    ));
    setEditingTask(null);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Open modal for new task
  const openAddModal = (columnId: ColumnId) => {
    setTargetColumnId(columnId);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTargetColumnId(task.columnId);
    setIsModalOpen(true);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string, sourceColumnId: ColumnId) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceColumnId', sourceColumnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (columnId: ColumnId) => {
    setDropTargetColumn(columnId);
  };

  const handleDragLeave = () => {
    setDropTargetColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: ColumnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    if (taskId) {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, columnId: targetColumnId }
          : task
      ));
    }
    
    setDraggingTaskId(null);
    setDropTargetColumn(null);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDropTargetColumn(null);
  };

  // Reset board
  const resetBoard = () => {
    if (confirm('Are you sure you want to reset the board? This will restore the sample data.')) {
      setTasks(sampleTasks);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const columnIds: ColumnId[] = ['todo', 'in-progress', 'done'];

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50
                 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950"
      onDragEnd={handleDragEnd}
    >
      {/* Page Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg 
                      border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600
                              flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Kanban Board
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {tasks.length} tasks • {filteredTasks.length} showing
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" 
                     fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl
                            border border-slate-200 dark:border-slate-700
                            bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                            placeholder:text-slate-400 dark:placeholder:text-slate-500
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                            transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Priority Filter */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                aria-label="Filter by priority"
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700
                          bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                          transition-all"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🔵 Medium</option>
                <option value="low">⚪ Low</option>
              </select>

              {/* Clear Filters Button */}
              <button
                onClick={() => { setSearchQuery(''); setFilterPriority('all'); }}
                aria-label="Clear filters"
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700
                          text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800
                          transition-colors text-sm font-medium"
              >
                Clear
              </button>

              {/* Reset Board Button */}
              <button
                onClick={resetBoard}
                aria-label="Reset board to sample data"
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700
                          text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800
                          transition-colors text-sm font-medium"
              >
                Reset
              </button>

              {/* Add Task Button */}
              <button
                onClick={() => openAddModal('todo')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600
                          hover:from-indigo-500 hover:to-violet-500
                          text-white font-medium shadow-lg shadow-indigo-500/25
                          hover:shadow-indigo-500/40 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Task</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6" aria-label="Kanban columns">
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin">
          {columnIds.map((columnId) => (
            <div
              key={columnId}
              onDragEnter={() => handleDragEnter(columnId)}
              onDragLeave={handleDragLeave}
            >
              <BoardColumn
                columnId={columnId}
                tasks={getColumnTasks(columnId)}
                onAddTask={openAddModal}
                onEditTask={openEditModal}
                onDeleteTask={handleDeleteTask}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isDropTarget={dropTargetColumn === columnId && draggingTaskId !== null}
                draggingTaskId={draggingTaskId}
              />
            </div>
          ))}
        </div>

        {/* Empty state when no tasks */}
        {filteredTasks.length === 0 && tasks.length > 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800
                            flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => { setSearchQuery(''); setFilterPriority('all'); }}
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {columnIds.map((columnId) => {
            const columnTasks = tasks.filter(t => t.columnId === columnId);
            const config = columnConfig[columnId];
            return (
              <div
                key={columnId}
                className="bg-white dark:bg-slate-800 rounded-xl p-4 
                          border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{config.icon}</span>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {config.title}
                  </span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {columnTasks.length}
                </p>
              </div>
            );
          })}
          <div className="bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📊</span>
              <span className="text-sm font-medium text-indigo-100">
                Total Tasks
              </span>
            </div>
            <p className="text-2xl font-bold">
              {tasks.length}
            </p>
          </div>
        </div>
      </section>

      {/* Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSave={editingTask ? handleEditTask : handleAddTask}
        initialColumnId={targetColumnId}
        editTask={editingTask}
      />
    </div>
  );
}
