# TaskBridge ERD Fix

## 1. Problems in the Original ERD

| # | Problem | Why it matters |
|---|---------|----------------|
| 1 | `task_owner_name` stored in Tasks | Redundant — the name already lives in Users. Changing a user's name would require updating every task row (update anomaly). Violates 3NF. |
| 2 | `users.id` missing PRIMARY KEY | Without a PK the column has no uniqueness guarantee and cannot be referenced as a FK target. |
| 3 | No FOREIGN KEY constraints | `tasks.user_id` and `tasks.project_id` have no enforced references, so orphan rows are possible. |
| 4 | No NOT NULL constraints | Critical fields like `name`, `email`, and `title` can be left blank. |
| 5 | `users.email` not UNIQUE | Two accounts could share the same email address. |
| 6 | Ambiguous "assigned" relationship line | The diagram draws a line from Users to Tasks but the relationship is already encoded by `user_id` FK — the extra line is misleading. |
| 7 | Projects ↔ Tasks relationship not shown | `tasks.project_id` exists but no relationship line was drawn to Projects. |

---

## 2. Corrected Design

- **Removed** `task_owner_name` from Tasks. The user's name is retrieved by joining Tasks with Users on `user_id`.
- **Added** `PRIMARY KEY` to `users.id`.
- **Added** `FOREIGN KEY` from `tasks.user_id → users(id)` and `tasks.project_id → projects(project_id)`.
- **Added** `NOT NULL` to all required fields.
- **Added** `UNIQUE` to `users.email`.
- Drew explicit one-to-many relationships:
  - Users → Tasks (one user assigned many tasks)
  - Projects → Tasks (one project contains many tasks)

---

## 3. Database Schema Explanation

```sql
CREATE TABLE users (
    id     SERIAL PRIMARY KEY,   -- auto-incrementing PK
    name   TEXT NOT NULL,
    email  TEXT NOT NULL UNIQUE  -- enforces one account per email
);

CREATE TABLE projects (
    project_id  SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT             -- optional free-text
);

CREATE TABLE tasks (
    task_id    SERIAL PRIMARY KEY,
    title      TEXT NOT NULL,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    project_id INT NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE
);
```

### Relationships

| Relationship | Cardinality | How enforced |
|---|---|---|
| Users → Tasks | One-to-many | `tasks.user_id` FK → `users.id` |
| Projects → Tasks | One-to-many | `tasks.project_id` FK → `projects.project_id` |

### Cascade behavior
- Deleting a **project** cascades and removes its tasks (`ON DELETE CASCADE`).
- Deleting a **user** sets their tasks' `user_id` to NULL (`ON DELETE SET NULL`), preserving task history.

---

## How to Run

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE taskbridge;"

# 2. Run the schema
psql -U postgres -d taskbridge -f schema.sql

# 3. Verify
psql -U postgres -d taskbridge -c "\dt"
psql -U postgres -d taskbridge -c "\d users"
psql -U postgres -d taskbridge -c "\d projects"
psql -U postgres -d taskbridge -c "\d tasks"
```