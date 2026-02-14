import React, {useCallback, useEffect, useState} from 'react';
import {createTask, listTasks,} from './api/tasksApi';
import type {TaskCreateRequest, TaskPage,} from './types/task';
import {TaskForm} from './components/TaskForm';
import {TaskList} from './components/TaskList';
import {TaskDetailModal} from './components/TaskDetailModal';
import {Modal} from './components/Modal';
import './App.css';

const PAGE_SIZE = 20;

type ModalMode = 'create' | { type: 'detail'; taskId: number } | null;

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
  const openTaskDetail = (taskId: number) => setModalMode({ type: 'detail', taskId });
  const closeModal = () => setModalMode(null);

  const handleCreate = async (data: TaskCreateRequest) => {
    await createTask(data);
    closeModal();
    await loadTasks(0);
  };

  const tasks = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? 0;

  const isCreate = modalMode === 'create';
  const isDetail = modalMode !== null && modalMode !== 'create';

  return (
    <div className="App">
      <header className="App-header">
        <h1>ToDoOps</h1>
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
            onTaskClick={openTaskDetail}
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

      {isDetail && (
        <TaskDetailModal
          taskId={modalMode.taskId}
          onClose={closeModal}
          onSaved={refreshList}
          onDeleted={refreshList}
        />
      )}
    </div>
  );
}

export default App;
