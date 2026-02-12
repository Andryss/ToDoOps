export type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  created_at: string;
  due_date: string | null;
}

export interface TaskPage {
  content: Task[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface TaskCreateRequest {
  title: string;
  description: string;
  due_date?: string | null;
}

export interface TaskUpdateRequest {
  title: string;
  description: string;
  due_date?: string | null;
}

export interface TaskStatusRequest {
  status: TaskStatus;
}

export interface ApiError {
  code: number;
  message: string;
  humanMessage: string;
}
