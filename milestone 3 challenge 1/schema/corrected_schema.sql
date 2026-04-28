-- ============================================================
-- TaskSphere - Corrected Database Schema
-- Original file: broken_schema.sql
--
-- Fixes applied:
--  1. Added PRIMARY KEYS to all tables
--  2. Fixed invalid data types (ID, VAR, INT for names)
--  3. Replaced text-based references with proper FOREIGN KEYS
--  4. Added UNIQUE constraint on email (prevents duplicate users)
--  5. Added UNIQUE constraint on project_name (prevents duplicate projects)
--  6. Added NOT NULL constraints throughout
--  7. Changed owner_name (string) → owner_id (FK to Users)
--  8. Changed assigned_user (string) → assigned_to (FK to Users)
--  9. Changed project_name in Tasks (string) → project_id (FK to Projects)
-- 10. Changed project_name in UserProjects (string) → project_id (FK to Projects)
-- 11. Changed user_name in UserProjects (string) → user_id (FK to Users)
-- 12. Added composite PK on UserProjects to prevent duplicate memberships
-- 13. Added ENUM on status to restrict to valid values only
-- 14. Added ON DELETE / ON UPDATE referential integrity rules
-- ============================================================

DROP TABLE IF EXISTS UserProjects;
DROP TABLE IF EXISTS Tasks;
DROP TABLE IF EXISTS Projects;
DROP TABLE IF EXISTS Users;

-- ============================================================
-- TABLE: Users
-- Fix 1: Added user_id as PRIMARY KEY
-- Fix 2: email type was ID(100) — invalid. Changed to VARCHAR(150)
-- Fix 3: Added UNIQUE on email to prevent duplicate accounts
-- Fix 4: Added NOT NULL constraints
-- ============================================================
CREATE TABLE Users (
    user_id     INT           NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  NOT NULL,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_users       PRIMARY KEY (user_id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- ============================================================
-- TABLE: Projects
-- Fix 1: Added project_id as PRIMARY KEY
-- Fix 2: Columns were CHAR(100) — changed to VARCHAR for efficiency
-- Fix 3: owner_name (plain string) → owner_id (INT, FK to Users)
--        This ensures a project always links to a real user
-- Fix 4: Added UNIQUE on project_name to prevent duplicate projects
-- Fix 5: Added NOT NULL constraints
-- ============================================================
CREATE TABLE Projects (
    project_id    INT           NOT NULL AUTO_INCREMENT,
    project_name  VARCHAR(150)  NOT NULL,
    owner_id      INT           NOT NULL,
    description   TEXT,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_projects         PRIMARY KEY (project_id),
    CONSTRAINT uq_projects_name    UNIQUE (project_name),
    CONSTRAINT fk_projects_owner   FOREIGN KEY (owner_id)
        REFERENCES Users(user_id)
        ON DELETE RESTRICT    -- cannot delete a user who owns a project
        ON UPDATE CASCADE
);

-- ============================================================
-- TABLE: Tasks
-- Fix 1: Added task_id as PRIMARY KEY
-- Fix 2: task_name was INT(100) — wrong type. Changed to VARCHAR(200)
-- Fix 3: project_name (string) → project_id (INT, FK to Projects)
-- Fix 4: assigned_user (string) → assigned_to (INT, FK to Users)
--        Tasks referencing non-existent users is now impossible
-- Fix 5: status changed from free VARCHAR to ENUM
--        Prevents invalid values like "done!!" or "COMPLETED"
-- Fix 6: Added NOT NULL constraints
-- ============================================================
CREATE TABLE Tasks (
    task_id      INT           NOT NULL AUTO_INCREMENT,
    task_name    VARCHAR(200)  NOT NULL,
    project_id   INT           NOT NULL,
    assigned_to  INT,                          -- nullable: task may be unassigned
    status       ENUM(
                   'todo',
                   'in_progress',
                   'done'
                 )             NOT NULL DEFAULT 'todo',
    due_date     DATE,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_tasks           PRIMARY KEY (task_id),
    CONSTRAINT fk_tasks_project   FOREIGN KEY (project_id)
        REFERENCES Projects(project_id)
        ON DELETE CASCADE     -- deleting a project removes its tasks
        ON UPDATE CASCADE,
    CONSTRAINT fk_tasks_assignee  FOREIGN KEY (assigned_to)
        REFERENCES Users(user_id)
        ON DELETE SET NULL    -- task becomes unassigned if user is deleted
        ON UPDATE CASCADE
);

-- ============================================================
-- TABLE: UserProjects  (junction / bridge table)
-- Fix 1: user_name was VAR(100) — invalid type. Replaced entirely
--        with user_id (INT, FK to Users)
-- Fix 2: project_name (string) → project_id (INT, FK to Projects)
-- Fix 3: Added composite PRIMARY KEY (user_id, project_id)
--        This prevents the same user being added to the same project twice
-- Fix 4: Added proper FOREIGN KEY constraints on both columns
-- Fix 5: Added joined_at timestamp for audit trail
-- ============================================================
CREATE TABLE UserProjects (
    user_id     INT       NOT NULL,
    project_id  INT       NOT NULL,
    joined_at   DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_user_projects   PRIMARY KEY (user_id, project_id),
    CONSTRAINT fk_up_user         FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE CASCADE     -- removing a user clears their project memberships
        ON UPDATE CASCADE,
    CONSTRAINT fk_up_project      FOREIGN KEY (project_id)
        REFERENCES Projects(project_id)
        ON DELETE CASCADE     -- removing a project clears its memberships
        ON UPDATE CASCADE
);