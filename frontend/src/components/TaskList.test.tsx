import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from './TaskList';
import { mockTask, mockTaskNoDue } from '../test/testData';

describe('TaskList', () => {
  const defaultProps = {
    tasks: [],
    page: 0,
    totalPages: 1,
    totalElements: 0,
    pageSize: 20,
    onPageChange: jest.fn(),
    onTaskClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state', () => {
    render(<TaskList {...defaultProps} loading />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows empty state when no tasks', () => {
    render(<TaskList {...defaultProps} loading={false} />);
    expect(screen.getByText(/No tasks yet/)).toBeInTheDocument();
  });

  it('renders task rows with title and due date', () => {
    const tasks = [mockTask, mockTaskNoDue];
    render(
      <TaskList
        {...defaultProps}
        tasks={tasks}
        totalElements={2}
        loading={false}
      />
    );
    expect(screen.getByText('Test task')).toBeInTheDocument();
    expect(screen.getByText('No due date')).toBeInTheDocument();
  });

  it('calls onTaskClick when a row is clicked', async () => {
    const onTaskClick = jest.fn();
    render(
      <TaskList
        {...defaultProps}
        tasks={[mockTask]}
        totalElements={1}
        loading={false}
        onTaskClick={onTaskClick}
      />
    );
    await userEvent.click(screen.getByText('Test task'));
    expect(onTaskClick).toHaveBeenCalledWith(1);
  });

  it('shows pagination when totalPages > 1', () => {
    render(
      <TaskList
        {...defaultProps}
        tasks={[mockTask]}
        totalElements={25}
        totalPages={2}
        pageSize={20}
        loading={false}
      />
    );
    expect(screen.getByText(/1–20 of 25/)).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of 2/)).toBeInTheDocument();
    const prev = screen.getByRole('button', { name: 'Previous' });
    const next = screen.getByRole('button', { name: 'Next' });
    expect(prev).toBeDisabled();
    expect(next).not.toBeDisabled();
  });

  it('calls onPageChange when Next is clicked', async () => {
    const onPageChange = jest.fn();
    render(
      <TaskList
        {...defaultProps}
        tasks={[mockTask]}
        totalElements={25}
        totalPages={2}
        page={0}
        loading={false}
        onPageChange={onPageChange}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
