-- TaskBridge Corrected Schema
-- Fixes applied:
--   1. Added PRIMARY KEY to users.id
--   2. Added UNIQUE + NOT NULL constraints to email
--   3. Added NOT NULL to all required fields
--   4. Added FOREIGN KEY references from tasks to users and projects
--   5. Removed redundant task_owner_name column

CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE
);

CREATE TABLE projects (
    project_id  SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT
);

CREATE TABLE tasks (
    task_id     SERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    project_id  INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE
);