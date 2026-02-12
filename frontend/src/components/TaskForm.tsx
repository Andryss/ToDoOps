import React, { useState, useEffect } from 'react';
import type { Task, TaskCreateRequest, TaskUpdateRequest } from '../types/task';

interface TaskFormProps {
  initial?: Task | null;
  onSubmit: (data: TaskCreateRequest | TaskUpdateRequest) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
}

export function TaskForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [dueDate, setDueDate] = useState(
    initial?.due_date
      ? initial.due_date.slice(0, 16)
      : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description);
      setDueDate(
        initial.due_date ? initial.due_date.slice(0, 16) : ''
      );
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
    }
  }, [initial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: TaskCreateRequest | TaskUpdateRequest = {
        title: title.trim(),
        description: description.trim(),
        due_date: dueDate.trim() || null,
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="form-row">
        <label htmlFor="task-title">Title</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          placeholder="Task title"
          disabled={loading}
        />
      </div>
      <div className="form-row">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          maxLength={4000}
          placeholder="Description"
          rows={3}
          disabled={loading}
        />
      </div>
      <div className="form-row">
        <label htmlFor="task-due">Due date (optional)</label>
        <input
          id="task-due"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
