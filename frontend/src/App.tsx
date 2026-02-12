import React, { useState, useEffect, useCallback } from 'react';
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  changeTaskStatus,
} from './api/tasksApi';
import type {
  Task,
  TaskPage,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskStatus,
} from './types/task';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { Modal } from './components/Modal';
import './App.css';

const PAGE_SIZE = 20;

type ModalMode = 'create' | { type: 'edit'; task: Task } | null;

function App() {
  const [pageData, setPageData] = useState<TaskPage | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  const loadTasks = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTasks(pageNum, PAGE_SIZE);
      setPageData(data);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks(0);
  }, [loadTasks]);

  const refreshList = useCallback(() => {
    loadTasks(page);
  }, [loadTasks, page]);

  const openCreateModal = () => setModalMode('create');
  const openEditModal = (task: Task) => setModalMode({ type: 'edit', task });
  const closeModal = () => setModalMode(null);

  const handleCreate = async (data: TaskCreateRequest) => {
    await createTask(data);
    closeModal();
    await loadTasks(0);
  };

  const handleUpdate = async (data: TaskUpdateRequest) => {
    if (modalMode === null || modalMode === 'create') return;
    await updateTask(modalMode.task.id, data);
    closeModal();
    await refreshList();
  };

  const handleStatusChange = async (id: number, status: TaskStatus) => {
    await changeTaskStatus(id, { status });
    if (modalMode !== null && modalMode !== 'create' && modalMode.task.id === id) {
      setModalMode({ type: 'edit', task: { ...modalMode.task, status } });
    }
    await refreshList();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this task?')) return;
    await deleteTask(id);
    if (modalMode !== null && modalMode !== 'create' && modalMode.task.id === id) {
      closeModal();
    }
    await refreshList();
  };

  const tasks = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? 0;

  const isCreate = modalMode === 'create';
  const isEdit = modalMode !== null && modalMode !== 'create';

  return (
    <div className="App">
      <header className="App-header">
        <h1>ToDo</h1>
      </header>
      <main className="App-main">
        {error && (
          <div className="App-error" role="alert">
            {error}
          </div>
        )}

        <section className="section-list">
          <div className="section-list-header">
            <h2>Tasks</h2>
            <button
              type="button"
              className="btn-create"
              onClick={openCreateModal}
            >
              New task
            </button>
          </div>
          <TaskList
            tasks={tasks}
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={(p) => loadTasks(p)}
            onStatusChange={handleStatusChange}
            onEdit={openEditModal}
            onDelete={handleDelete}
            loading={loading}
          />
        </section>
      </main>

      {isCreate && (
        <Modal title="New task" onClose={closeModal}>
          <TaskForm
            initial={null}
            onSubmit={handleCreate}
            onCancel={closeModal}
            submitLabel="Create"
          />
        </Modal>
      )}

      {isEdit && (
        <Modal title="Edit task" onClose={closeModal}>
          <TaskForm
            initial={modalMode.task}
            onSubmit={handleUpdate}
            onCancel={closeModal}
            submitLabel="Update"
          />
        </Modal>
      )}
    </div>
  );
}

export default App;
