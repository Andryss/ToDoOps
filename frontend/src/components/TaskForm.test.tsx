import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from './TaskForm';
import { mockTask } from '../test/testData';

describe('TaskForm', () => {
  const mockSubmit = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create form with empty fields and Create button', () => {
    render(
      <TaskForm
        initial={null}
        onSubmit={mockSubmit}
        submitLabel="Create"
      />
    );
    expect(screen.getByLabelText(/Title/)).toHaveValue('');
    expect(screen.getByLabelText(/Description/)).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('renders edit form with initial values', () => {
    render(
      <TaskForm
        initial={mockTask}
        onSubmit={mockSubmit}
        onCancel={jest.fn()}
        submitLabel="Update"
      />
    );
    expect(screen.getByLabelText(/Title/)).toHaveValue(mockTask.title);
    expect(screen.getByLabelText(/Description/)).toHaveValue(mockTask.description);
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
  });

  it('shows validation error when submitting empty title', async () => {
    render(
      <TaskForm initial={null} onSubmit={mockSubmit} submitLabel="Create" />
    );
    await userEvent.type(screen.getByLabelText(/Description/), 'Some desc');
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when submitting empty description', async () => {
    render(
      <TaskForm initial={null} onSubmit={mockSubmit} submitLabel="Create" />
    );
    await userEvent.type(screen.getByLabelText(/Title/), 'Some title');
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with trimmed data when form is valid', async () => {
    render(
      <TaskForm initial={null} onSubmit={mockSubmit} submitLabel="Create" />
    );
    await userEvent.type(screen.getByLabelText(/Title/), '  My task  ');
    await userEvent.type(screen.getByLabelText(/Description/), '  My description  ');
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'My task',
          description: 'My description',
        })
      );
    });
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = jest.fn();
    render(
      <TaskForm
        initial={null}
        onSubmit={mockSubmit}
        onCancel={onCancel}
        submitLabel="Create"
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows character count for title and description', () => {
    render(
      <TaskForm initial={mockTask} onSubmit={mockSubmit} submitLabel="Update" />
    );
    expect(screen.getByText(`${mockTask.title.length}/200`)).toBeInTheDocument();
    expect(screen.getByText(`${mockTask.description.length}/4000`)).toBeInTheDocument();
  });
});
