import type { Task, TaskPage } from '../types/task';

export const mockTask: Task = {
  id: 1,
  title: 'Test task',
  description: 'Test description',
  status: 'NEW',
  created_at: '2025-02-10T12:00:00Z',
  due_date: '2025-02-15T18:00:00Z',
};

export const mockTaskNoDue: Task = {
  ...mockTask,
  id: 2,
  title: 'No due date',
  due_date: null,
};

export function mockTaskPage(overrides: Partial<TaskPage> & { content: Task[] }): TaskPage {
  return {
    totalElements: overrides.content.length,
    totalPages: 1,
    size: 20,
    number: 0,
    ...overrides,
  };
}
