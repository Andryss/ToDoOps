import React from 'react';
import type { Task, TaskStatus } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  NEW: 'New',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
};

/** Allowed next steps: NEW → IN_PROGRESS → COMPLETED (no going back). */
function getStatusOptions(current: TaskStatus): TaskStatus[] {
  switch (current) {
    case 'NEW':
      return ['NEW', 'IN_PROGRESS'];
    case 'IN_PROGRESS':
      return ['IN_PROGRESS', 'COMPLETED'];
    case 'COMPLETED':
      return ['COMPLETED'];
    default:
      return [current];
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function TaskList({
  tasks,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onStatusChange,
  onEdit,
  onDelete,
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
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Status</th>
                <th>Due date</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td className="cell-description">
                    {task.description || '—'}
                  </td>
                  <td>
                    <select
                      value={task.status}
                      onChange={(e) =>
                        onStatusChange(
                          task.id,
                          e.target.value as TaskStatus
                        )
                      }
                      aria-label={`Status for ${task.title}`}
                    >
                      {getStatusOptions(task.status).map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{formatDate(task.due_date)}</td>
                  <td>{formatDate(task.created_at)}</td>
                  <td className="cell-actions">
                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(task.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
