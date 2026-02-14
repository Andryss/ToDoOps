import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskDetailModal } from './TaskDetailModal';
import * as tasksApi from '../api/tasksApi';
import { mockTask } from '../test/testData';

jest.mock('../api/tasksApi');

const mockGetTask = tasksApi.getTask as jest.MockedFunction<typeof tasksApi.getTask>;
const mockUpdateTask = tasksApi.updateTask as jest.MockedFunction<typeof tasksApi.updateTask>;
const mockDeleteTask = tasksApi.deleteTask as jest.MockedFunction<typeof tasksApi.deleteTask>;
const mockChangeTaskStatus = tasksApi.changeTaskStatus as jest.MockedFunction<
  typeof tasksApi.changeTaskStatus
>;

describe('TaskDetailModal', () => {
  const onClose = jest.fn();
  const onSaved = jest.fn();
  const onDeleted = jest.fn();

  function renderModal() {
    return render(
      <TaskDetailModal
        taskId={mockTask.id}
        onClose={onClose}
        onSaved={onSaved}
        onDeleted={onDeleted}
      />
    );
  }

  async function openDeleteConfirm() {
    renderModal();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => {
      expect(screen.getByText('Delete this task?')).toBeInTheDocument();
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTask.mockResolvedValue(mockTask);
  });

  it('shows loading then task form after getTask resolves', async () => {
    renderModal();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(mockGetTask).toHaveBeenCalledWith(mockTask.id);

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockTask.title)).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue(mockTask.description)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('shows error when getTask fails', async () => {
    mockGetTask.mockRejectedValue(new Error('Not found'));
    renderModal();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Not found');
    });
  });

  it('calls updateTask and onSaved when Save is clicked with unchanged status', async () => {
    mockUpdateTask.mockResolvedValue(mockTask);
    renderModal();
    await waitFor(() => {
      expect(screen.getByDisplayValue(mockTask.title)).toBeInTheDocument();
    });

    await userEvent.clear(screen.getByLabelText(/Title/));
    await userEvent.type(screen.getByLabelText(/Title/), 'Updated title');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith(
        mockTask.id,
        expect.objectContaining({
          title: 'Updated title',
          description: mockTask.description,
        })
      );
    });
    expect(mockChangeTaskStatus).not.toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('calls changeTaskStatus when status is changed and Save', async () => {
    mockUpdateTask.mockResolvedValue(mockTask);
    mockChangeTaskStatus.mockResolvedValue({ ...mockTask, status: 'IN_PROGRESS' });
    renderModal();
    await waitFor(() => {
      expect(screen.getByDisplayValue(mockTask.title)).toBeInTheDocument();
    });

    await userEvent.selectOptions(screen.getByLabelText(/Status/), 'IN_PROGRESS');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalled();
    });
    expect(mockChangeTaskStatus).toHaveBeenCalledWith(mockTask.id, { status: 'IN_PROGRESS' });
    expect(onSaved).toHaveBeenCalled();
  });

  it('shows delete confirm and calls deleteTask and onDeleted when Delete confirmed', async () => {
    mockDeleteTask.mockResolvedValue(undefined);
    await openDeleteConfirm();

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith(mockTask.id);
    });
    expect(onDeleted).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('closes delete confirm when Cancel is clicked', async () => {
    await openDeleteConfirm();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockDeleteTask).not.toHaveBeenCalled();
    expect(screen.queryByText('Delete this task?')).not.toBeInTheDocument();
  });

  it('shows discard confirm when form is dirty and Cancel is clicked', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByDisplayValue(mockTask.title)).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/Title/), ' changed');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.getByText('You have unsaved changes. Discard them?')).toBeInTheDocument();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Discard is clicked in discard confirm', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByDisplayValue(mockTask.title)).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/Title/), ' x');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => {
      expect(screen.getByText(/Discard them?/)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole('button', { name: 'Discard' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows validation error when Save with empty title', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByDisplayValue(mockTask.title)).toBeInTheDocument();
    });

    await userEvent.clear(screen.getByLabelText(/Title/));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
    expect(mockUpdateTask).not.toHaveBeenCalled();
  });
});
