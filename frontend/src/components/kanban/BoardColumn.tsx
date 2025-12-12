import { useState } from 'react';
import type { Task, ColumnId } from '../../types/kanban';
import { columnConfig } from '../../types/kanban';
import { TaskCard } from './TaskCard';

interface BoardColumnProps {
  columnId: ColumnId;
  tasks: Task[];
  onAddTask: (columnId: ColumnId) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string, sourceColumnId: ColumnId) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetColumnId: ColumnId) => void;
  isDropTarget: boolean;
  draggingTaskId: string | null;
}

export function BoardColumn({
  columnId,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDragStart,
  onDragOver,
  onDrop,
  isDropTarget,
  draggingTaskId,
}: BoardColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const config = columnConfig[columnId];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(e);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(e, columnId);
  };

  return (
    <div
      className={`flex flex-col min-w-[320px] max-w-[320px] lg:min-w-[340px] lg:max-w-[340px]
                  bg-slate-50 dark:bg-slate-900/50 rounded-2xl
                  transition-all duration-300
                  ${isCollapsed ? 'w-16 min-w-16' : ''}
                  ${isDropTarget ? 'ring-2 ring-indigo-400 dark:ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className={`sticky top-0 z-10 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-t-2xl
                       border-t-4 ${config.color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Collapse button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300
                        hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label={isCollapsed ? 'Expand column' : 'Collapse column'}
            >
              <svg 
                className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={isCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
              </svg>
            </button>

            {!isCollapsed && (
              <>
                <span className="text-lg">{config.icon}</span>
                <h2 className="font-semibold text-slate-800 dark:text-white">
                  {config.title}
                </h2>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full
                                bg-slate-200 dark:bg-slate-700 
                                text-slate-600 dark:text-slate-300">
                  {tasks.length}
                </span>
              </>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => onAddTask(columnId)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400
                        hover:bg-white dark:hover:bg-slate-800 transition-all
                        shadow-sm hover:shadow"
              aria-label={`Add task to ${config.title}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>

        {/* Collapsed view - vertical text */}
        {isCollapsed && (
          <div className="mt-4 flex flex-col items-center">
            <span className="text-2xl mb-2">{config.icon}</span>
            <span className="writing-vertical text-sm font-medium text-slate-600 dark:text-slate-400"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              {config.title}
            </span>
            <span className="mt-2 px-2 py-0.5 text-xs font-medium rounded-full
                            bg-slate-200 dark:bg-slate-700 
                            text-slate-600 dark:text-slate-300">
              {tasks.length}
            </span>
          </div>
        )}
      </div>

      {/* Tasks Container */}
      {!isCollapsed && (
        <div 
          className={`flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]
                      scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600
                      scrollbar-track-transparent
                      ${isDropTarget ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
        >
          {tasks.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-8 px-4
                            border-2 border-dashed rounded-xl transition-colors
                            ${isDropTarget 
                              ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                              : 'border-slate-200 dark:border-slate-700'}`}>
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 
                              flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                {isDropTarget ? 'Drop task here' : 'No tasks yet'}
              </p>
              <button
                onClick={() => onAddTask(columnId)}
                className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 
                          hover:text-indigo-700 dark:hover:text-indigo-300
                          font-medium transition-colors"
              >
                + Add a task
              </button>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                draggable="true"
                onDragStart={(e) => onDragStart(e, task.id, columnId)}
                className={`transition-all duration-200 ${draggingTaskId === task.id ? 'opacity-50' : ''}`}
              >
                <TaskCard
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  isDragging={draggingTaskId === task.id}
                />
              </div>
            ))
          )}

          {/* Drop zone indicator at bottom */}
          {tasks.length > 0 && isDropTarget && (
            <div className="h-20 border-2 border-dashed border-indigo-300 dark:border-indigo-600 
                            rounded-xl flex items-center justify-center
                            bg-indigo-50/50 dark:bg-indigo-900/20 animate-fadeIn">
              <span className="text-sm text-indigo-500 dark:text-indigo-400">
                Drop here
              </span>
            </div>
          )}
        </div>
      )}

      {/* Add Task Button at bottom */}
      {!isCollapsed && tasks.length > 0 && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-700/50">
          <button
            onClick={() => onAddTask(columnId)}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium
                      text-slate-600 dark:text-slate-400
                      hover:text-indigo-600 dark:hover:text-indigo-400
                      hover:bg-white dark:hover:bg-slate-800
                      border border-transparent hover:border-slate-200 dark:hover:border-slate-700
                      transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add task
          </button>
        </div>
      )}
    </div>
  );
}

