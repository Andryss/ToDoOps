import React from 'react';
import type { Task } from '../types/task';
import { formatDateTime } from '../utils/dateFormat';

interface TaskListProps {
  tasks: Task[];
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onTaskClick: (taskId: number) => void;
  loading?: boolean;
}

export function TaskList({
  tasks,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onTaskClick,
  loading,
}: TaskListProps) {
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="task-list">
      {loading && <div className="list-loading">Loading…</div>}
      {!loading && tasks.length === 0 && (
        <p className="list-empty">No tasks yet. Click “New task” to create one.</p>
      )}
      {!loading && tasks.length > 0 && (
        <>
          <div className="task-rows">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="task-row"
                onClick={() => onTaskClick(task.id)}
              >
                <span className="task-row-title">{task.title}</span>
                {task.due_date && (
                  <span className="task-row-due">
                    {formatDateTime(task.due_date)}
                  </span>
                )}
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <span className="pagination-info">
                {from}–{to} of {totalElements}
              </span>
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 0}
              >
                Previous
              </button>
              <span className="pagination-page">
                Page {page + 1} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages - 1}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
