import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as tasksApi from './api/tasksApi';
import { mockTask, mockTaskPage } from './test/testData';

jest.mock('./api/tasksApi');

const mockListTasks = tasksApi.listTasks as jest.MockedFunction<typeof tasksApi.listTasks>;
const mockCreateTask = tasksApi.createTask as jest.MockedFunction<typeof tasksApi.createTask>;

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListTasks.mockResolvedValue(mockTaskPage({ content: [] }));
  });

  it('renders app title and Tasks section', async () => {
    render(<App />);
    await waitFor(() => {
      expect(mockListTasks).toHaveBeenCalledWith(0, 20);
    });
    expect(screen.getByRole('heading', { name: 'ToDoOps' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tasks' })).toBeInTheDocument();
  });

  it('shows loading then empty state when no tasks', async () => {
    render(<App />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/No tasks yet/)).toBeInTheDocument();
    });
    expect(mockListTasks).toHaveBeenCalledWith(0, 20);
  });

  it('shows task list when listTasks returns tasks', async () => {
    mockListTasks.mockResolvedValue(mockTaskPage({ content: [mockTask] }));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    });
  });

  it('shows error when listTasks fails', async () => {
    mockListTasks.mockRejectedValue(new Error('Network error'));
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error');
    });
  });

  it('opens New task modal and create flow', async () => {
    mockCreateTask.mockResolvedValue({ ...mockTask, id: 99 });
    mockListTasks
      .mockResolvedValueOnce(mockTaskPage({ content: [] }))
      .mockResolvedValueOnce(mockTaskPage({ content: [{ ...mockTask, id: 99, title: 'New task' }] }));

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/No tasks yet/)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'New task' }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'New task' })).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/Title/), 'New task');
    await userEvent.type(screen.getByLabelText(/Description/), 'New description');
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New task', description: 'New description' })
      );
    });
    await waitFor(() => {
      expect(mockListTasks).toHaveBeenCalledTimes(2);
    });
  });

  it('opens task detail when clicking a task row', async () => {
    const mockGetTask = tasksApi.getTask as jest.MockedFunction<typeof tasksApi.getTask>;
    mockGetTask.mockResolvedValue(mockTask);
    mockListTasks.mockResolvedValue(mockTaskPage({ content: [mockTask] }));

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(mockTask.title));

    await waitFor(() => {
      expect(mockGetTask).toHaveBeenCalledWith(mockTask.id);
    });
    await waitFor(() => {
      expect(screen.getByDisplayValue(mockTask.title)).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue(mockTask.description)).toBeInTheDocument();
  });

  it('pagination loads next page', async () => {
    mockListTasks
      .mockResolvedValueOnce(
        mockTaskPage({ content: [mockTask], totalPages: 2, totalElements: 25 })
      )
      .mockResolvedValueOnce(
        mockTaskPage({
          content: [{ ...mockTask, id: 2, title: 'Page 2 task' }],
          number: 1,
          totalPages: 2,
          totalElements: 25,
        })
      );

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(mockTask.title)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(mockListTasks).toHaveBeenLastCalledWith(1, 20);
    });
    await waitFor(() => {
      expect(screen.getByText('Page 2 task')).toBeInTheDocument();
    });
  });
});
