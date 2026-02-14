import React, { useState, useEffect, useCallback } from 'react';
import { getTask, updateTask, deleteTask, changeTaskStatus } from '../api/tasksApi';
import type { Task, TaskStatus, TaskUpdateRequest } from '../types/task';
import { validateTaskForm, TITLE_MAX_LENGTH, DESCRIPTION_MAX_LENGTH } from '../utils/taskValidation';
import { Modal } from './Modal';

const STATUS_LABELS: Record<TaskStatus, string> = {
  NEW: 'New',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
};

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

interface TaskDetailModalProps {
  taskId: number;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

export function TaskDetailModal({
  taskId,
  onClose,
  onSaved,
  onDeleted,
}: TaskDetailModalProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('NEW');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const initialDueDate = task ? (task.due_date ? task.due_date.slice(0, 16) : '') : '';
  const isDirty =
      !!task &&
      (title !== task.title ||
          description !== task.description ||
          status !== task.status ||
          dueDate !== initialDueDate);

  const fetchTask = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getTask(taskId);
      setTask(data);
      setTitle(data.title);
      setDescription(data.description);
      setStatus(data.status);
      setDueDate(data.due_date ? data.due_date.slice(0, 16) : '');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load task');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    setFormError(null);
    const validationError = validateTaskForm(title, description);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setSaving(true);
    try {
      const payload: TaskUpdateRequest = {
        title: title.trim(),
        description: description.trim(),
        due_date: dueDate.trim() || null,
      };
      await updateTask(task.id, payload);
      if (status !== task.status) {
        await changeTaskStatus(task.id, { status });
      }
      onSaved();
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!task) return;
    setShowDeleteConfirm(false);
    try {
      await deleteTask(task.id);
      onDeleted();
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleCloseRequest = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleDiscard = () => {
    setShowDiscardConfirm(false);
    onClose();
  };

  return (
    <Modal title="Task" onClose={handleCloseRequest}>
      {loading && <div className="modal-loading">Loading…</div>}
      {loadError && (
        <div className="modal-error" role="alert">
          {loadError}
        </div>
      )}
      {showDiscardConfirm && (
        <div className="discard-confirm">
          <p>You have unsaved changes. Discard them?</p>
          <div className="discard-confirm-actions">
            <button
              type="button"
              className="btn-keep-editing"
              onClick={() => setShowDiscardConfirm(false)}
            >
              Keep editing
            </button>
            <button
              type="button"
              className="btn-discard"
              onClick={handleDiscard}
            >
              Discard
            </button>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="discard-confirm">
          <p>Delete this task?</p>
          <div className="discard-confirm-actions">
            <button
              type="button"
              className="btn-keep-editing"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-discard"
              onClick={handleDeleteConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      )}
      {!loading && !loadError && task && !showDiscardConfirm && !showDeleteConfirm && (
        <form onSubmit={handleSave} className="task-form">
          {formError && (
            <div className="form-error" role="alert">
              {formError}
            </div>
          )}
          <div className="form-row">
            <label htmlFor="task-detail-title">
              Title <span className="form-required">*</span>
            </label>
            <input
              id="task-detail-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={TITLE_MAX_LENGTH}
              disabled={saving}
            />
            <span className="form-field-count">{title.length}/{TITLE_MAX_LENGTH}</span>
          </div>
          <div className="form-row">
            <label htmlFor="task-detail-description">
              Description <span className="form-required">*</span>
            </label>
            <textarea
              id="task-detail-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={DESCRIPTION_MAX_LENGTH}
              rows={3}
              disabled={saving}
            />
            <span className="form-field-count">{description.length}/{DESCRIPTION_MAX_LENGTH}</span>
          </div>
          <div className="form-row">
            <label htmlFor="task-detail-status">Status</label>
            <select
              id="task-detail-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              disabled={saving}
            >
              {getStatusOptions(task.status).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="task-detail-due">Due date</label>
            <input
              id="task-detail-due"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="form-actions form-actions-with-delete">
            <div className="form-actions-left">
              <button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={handleCloseRequest} disabled={saving}>
                Cancel
              </button>
            </div>
            <button
              type="button"
              className="btn-delete"
              onClick={requestDelete}
              disabled={saving}
            >
              Delete
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
