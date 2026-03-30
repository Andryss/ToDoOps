import type {
  Task,
  TaskPage,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskStatusRequest,
  ApiError,
} from '../types/task';

const API_BASE =
  process.env.REACT_APP_API_URL || '/api/v1';

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!response.ok) {
    const err = (data as ApiError) || {
      code: response.status,
      message: 'error',
      humanMessage: response.statusText,
    };
    throw new Error(err.humanMessage || err.message || 'Request failed');
  }
  return data as T;
}

function jsonHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export async function listTasks(
  page: number = 0,
  size: number = 20
): Promise<TaskPage> {
  const url = `${API_BASE}/tasks?page=${page}&size=${size}`;
  const response = await fetch(url);
  return handleResponse<TaskPage>(response);
}

export async function getTask(id: number): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}`);
  return handleResponse<Task>(response);
}

export async function createTask(
  body: TaskCreateRequest
): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<Task>(response);
}

export async function updateTask(
  id: number,
  body: TaskUpdateRequest
): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<Task>(response);
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    throw new Error(
      (data as ApiError).humanMessage ||
        (data as ApiError).message ||
        'Delete failed'
    );
  }
}

export async function changeTaskStatus(
  id: number,
  body: TaskStatusRequest
): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}/status`, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse<Task>(response);
}
