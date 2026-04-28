# TaskSphere — Schema Debug Report
**File:** `changes.md`  
**Project:** TaskSphere | Milestone-03: Debug a Broken ER Diagram

---

## Overview

The original schema had critical structural flaws that caused duplicate records, missing data integrity, and slow queries. Below is a full breakdown of every problem found and the fix applied.

---

## Table-by-Table Changes

---

### 1. Users Table

**Problems Found:**
- No PRIMARY KEY — the database had no way to uniquely identify a user
- `email` column used an invalid data type `ID(100)` — this is not a valid SQL type
- No UNIQUE constraint on `email` — duplicate user accounts could be created silently
- No NOT NULL constraints — name and email could be left completely empty

**Fixes Applied:**
- Added `user_id INT AUTO_INCREMENT` as the PRIMARY KEY
- Changed `email` type from `ID(100)` to `VARCHAR(150)`
- Added `UNIQUE` constraint on `email`
- Added `NOT NULL` on all required columns
- Added `created_at DATETIME DEFAULT CURRENT_TIMESTAMP` for audit trail

---

### 2. Projects Table

**Problems Found:**
- No PRIMARY KEY — projects could not be uniquely identified
- Columns used `CHAR(100)` — inefficient fixed-width storage for variable-length strings
- `owner_name` stored a plain text string instead of referencing a User — anyone could write any name with no validation
- No UNIQUE constraint on `project_name` — duplicate project names were possible
- No NOT NULL constraints

**Fixes Applied:**
- Added `project_id INT AUTO_INCREMENT` as the PRIMARY KEY
- Changed `CHAR(100)` columns to `VARCHAR` for storage efficiency
- Replaced `owner_name VARCHAR` with `owner_id INT`, a FOREIGN KEY referencing `Users(user_id)`
  - `ON DELETE RESTRICT` — prevents deleting a user who still owns a project
  - `ON UPDATE CASCADE` — if user_id changes, the reference updates automatically
- Added `UNIQUE` constraint on `project_name`
- Added `NOT NULL` on required columns

---

### 3. Tasks Table

**Problems Found:**
- No PRIMARY KEY — tasks could not be uniquely identified
- `task_name` used `INT(100)` — a task name is text, not a number; completely wrong data type
- `project_name` stored a plain string instead of a foreign key to Projects
- `assigned_user` stored a plain string instead of a foreign key to Users — tasks could reference users who don't exist
- `status` was a free-text `VARCHAR` — values like `"DONE"`, `"done!!"`, `"completed"` were all allowed, causing inconsistency
- No NOT NULL constraints

**Fixes Applied:**
- Added `task_id INT AUTO_INCREMENT` as the PRIMARY KEY
- Changed `task_name` from `INT(100)` to `VARCHAR(200)`
- Replaced `project_name VARCHAR` with `project_id INT`, a FOREIGN KEY referencing `Projects(project_id)`
  - `ON DELETE CASCADE` — deleting a project automatically removes its tasks
- Replaced `assigned_user VARCHAR` with `assigned_to INT`, a FOREIGN KEY referencing `Users(user_id)`
  - Kept nullable (`NULL` allowed) — a task may be unassigned
  - `ON DELETE SET NULL` — if a user is deleted, the task becomes unassigned instead of breaking
- Changed `status` from free-text `VARCHAR` to a strict `ENUM('todo', 'in_progress', 'done')`
- Added `due_date DATE` and `created_at DATETIME` columns

---

### 4. UserProjects Table (Junction Table)

**Problems Found:**
- `user_name` used `VAR(100)` — this is not a valid SQL data type
- `project_name` stored a plain string instead of a reference to Projects
- No PRIMARY KEY at all — the same user could be added to the same project multiple times, creating duplicate membership rows
- No FOREIGN KEY constraints — rows could reference users or projects that do not exist

**Fixes Applied:**
- Replaced `user_name VAR(100)` with `user_id INT`, a FOREIGN KEY referencing `Users(user_id)`
  - `ON DELETE CASCADE` — removing a user clears all their project memberships
- Replaced `project_name VARCHAR` with `project_id INT`, a FOREIGN KEY referencing `Projects(project_id)`
  - `ON DELETE CASCADE` — removing a project clears all its membership records
- Added a **composite PRIMARY KEY** on `(user_id, project_id)` — this makes it impossible to add the same user to the same project twice
- Added `joined_at DATETIME DEFAULT CURRENT_TIMESTAMP` for audit trail

---

## Summary of All Fixes

| # | Issue | Fix |
|---|-------|-----|
| 1 | No PRIMARY KEYs on any table | Added auto-increment PKs to all tables |
| 2 | Invalid data types (`ID`, `VAR`, `INT` for names) | Replaced with correct types (`VARCHAR`, `INT`) |
| 3 | Text-based references instead of FOREIGN KEYs | Added proper FK constraints with referential actions |
| 4 | Duplicate user accounts possible | Added UNIQUE on `email` |
| 5 | Duplicate project names possible | Added UNIQUE on `project_name` |
| 6 | Missing NOT NULL constraints | Added throughout all tables |
| 7 | `owner_name` (string) in Projects | Replaced with `owner_id` FK to Users |
| 8 | `assigned_user` (string) in Tasks | Replaced with `assigned_to` FK to Users |
| 9 | `project_name` (string) in Tasks | Replaced with `project_id` FK to Projects |
| 10 | `project_name` (string) in UserProjects | Replaced with `project_id` FK to Projects |
| 11 | `user_name` (string) in UserProjects | Replaced with `user_id` FK to Users |
| 12 | No duplicate membership prevention | Added composite PK on UserProjects |
| 13 | `status` accepted any text value | Changed to ENUM restricting valid values |
| 14 | No referential integrity rules | Added ON DELETE / ON UPDATE actions |

---

## Normalization

The corrected schema is in **Third Normal Form (3NF)**:
- Every non-key attribute depends only on the primary key (no partial or transitive dependencies)
- No redundant data is stored across tables — names and strings are never duplicated; only IDs are referenced
- `UserProjects` is a proper bridge/junction table with its own composite key

---

