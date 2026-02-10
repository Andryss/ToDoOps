--liquibase formatted sql

--changeset todoops:create-task-table
create table task (
    id bigserial primary key,
    title text not null,
    description text,
    status text not null,
    created_at timestamp not null,
    due_date timestamp
);

comment on table task is 'Todo tasks';
comment on column task.id is 'Task identifier';
comment on column task.title is 'Task title';
comment on column task.description is 'Task description';
comment on column task.status is 'Task status';
comment on column task.created_at is 'Creation timestamp';
comment on column task.due_date is 'Due date';
