import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  changeTaskStatus,
} from './tasksApi';
import type { Task, TaskPage } from '../types/task';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function jsonResponse(
  ok: boolean,
  payload: unknown,
  init?: { status?: number; statusText?: string }
): Response {
  const status = init?.status ?? (ok ? 200 : 500);
  const statusText = init?.statusText ?? (ok ? 'OK' : 'Error');
  const text =
    payload === undefined || payload === null
      ? ''
      : typeof payload === 'string'
        ? payload
        : JSON.stringify(payload);
  return {
    ok,
    status,
    statusText,
    text: jest.fn().mockResolvedValue(text),
  } as unknown as Response;
}

describe('tasksApi', () => {
  const sampleTask: Task = {
    id: 1,
    title: 'T',
    description: 'D',
    status: 'NEW',
    created_at: '2025-01-01T00:00:00Z',
    due_date: null,
  };

  const samplePage: TaskPage = {
    content: [sampleTask],
    totalElements: 1,
    totalPages: 1,
    size: 20,
    number: 0,
  };

  beforeEach(() => {
    mockFetch.mockReset();
    delete process.env.REACT_APP_API_URL;
  });

  describe('listTasks', () => {
    it('GETs /api/v1/tasks with default pagination', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(true, samplePage));
      const result = await listTasks();
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/tasks?page=0&size=20');
      expect(result).toEqual(samplePage);
    });

    it('GETs with custom page and size', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(true, samplePage));
      await listTasks(2, 10);
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/tasks?page=2&size=10');
    });

    it('uses REACT_APP_API_URL when set', async () => {
      jest.resetModules();
      process.env.REACT_APP_API_URL = 'https://api.example/v1';
      const { listTasks: listTasksWithCustomBase } = await import('./tasksApi');
      mockFetch.mockResolvedValueOnce(jsonResponse(true, samplePage));
      await listTasksWithCustomBase();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example/v1/tasks?page=0&size=20'
      );
      delete process.env.REACT_APP_API_URL;
      jest.resetModules();
    });

    it('throws with humanMessage from ApiError body', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(false, {
          code: 400,
          message: 'bad',
          humanMessage: 'Title is required',
        }, { status: 400, statusText: 'Bad Request' })
      );
      await expect(listTasks()).rejects.toThrow('Title is required');
    });

    it('throws with message when humanMessage missing', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(false, { code: 500, message: 'Server blew up', humanMessage: '' }, {
          status: 500,
          statusText: 'Internal Server Error',
        })
      );
      await expect(listTasks()).rejects.toThrow('Server blew up');
    });

    it('throws with message when humanMessage and statusText are empty', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(false, null, { status: 502, statusText: '' })
      );
      await expect(listTasks()).rejects.toThrow('error');
    });

    it('throws Request failed when ApiError body has no usable messages', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(false, { code: 418, message: '', humanMessage: '' }, {
          status: 418,
          statusText: '',
        })
      );
      await expect(listTasks()).rejects.toThrow('Request failed');
    });
  });

  describe('getTask', () => {
    it('GETs single task', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(true, sampleTask));
      const result = await getTask(42);
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/tasks/42');
      expect(result).toEqual(sampleTask);
    });
  });

  describe('createTask', () => {
    it('POSTs JSON body', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(true, sampleTask));
      const body = { title: 'New', description: 'Desc' };
      const result = await createTask(body);
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
      expect(result).toEqual(sampleTask);
    });
  });

  describe('updateTask', () => {
    it('PUTs JSON body', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(true, sampleTask));
      const body = { title: 'U', description: 'V' };
      await updateTask(7, body);
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/tasks/7', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
    });
  });

  describe('deleteTask', () => {
    it('resolves when response is ok', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(true, null, { status: 204, statusText: 'No Content' })
      );
      await expect(deleteTask(99)).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/tasks/99', {
        method: 'DELETE',
      });
    });

    it('throws with humanMessage from error JSON', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(false, {
          code: 404,
          message: 'nf',
          humanMessage: 'Task not found',
        }, { status: 404, statusText: 'Not Found' })
      );
      await expect(deleteTask(1)).rejects.toThrow('Task not found');
    });

    it('throws with message when humanMessage missing', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(false, { code: 403, message: 'Forbidden', humanMessage: '' }, {
          status: 403,
          statusText: 'Forbidden',
        })
      );
      await expect(deleteTask(1)).rejects.toThrow('Forbidden');
    });

    it('throws Delete failed when error response has empty body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Error',
        text: jest.fn().mockResolvedValue(''),
      } as unknown as Response);
      await expect(deleteTask(1)).rejects.toThrow('Delete failed');
    });

    it('throws Delete failed when error JSON has no messages', async () => {
      mockFetch.mockResolvedValueOnce(
        jsonResponse(false, {}, { status: 500, statusText: 'Error' })
      );
      await expect(deleteTask(1)).rejects.toThrow('Delete failed');
    });
  });

  describe('changeTaskStatus', () => {
    it('PATCHes status', async () => {
      const updated = { ...sampleTask, status: 'IN_PROGRESS' as const };
      mockFetch.mockResolvedValueOnce(jsonResponse(true, updated));
      const body = { status: 'IN_PROGRESS' as const };
      const result = await changeTaskStatus(3, body);
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/tasks/3/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
      expect(result).toEqual(updated);
    });
  });
});
