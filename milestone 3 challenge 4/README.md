# Document Your Index Fixes Here

## Original Index

```sql
CREATE INDEX idx_salary_department ON employees(salary, department);
```

---

## Issue Observed

Running the query with `EXPLAIN ANALYZE`:

```sql
EXPLAIN ANALYZE
SELECT *
FROM employees
WHERE department = 'Sales'
AND salary > 50000;
```

**Output (with broken index):**
```
Seq Scan on employees  (cost=0.00..1.18 rows=2 width=...)
  Filter: ((department)::text = 'Sales') AND (salary > '50000'::numeric)
Planning Time: 0.X ms
Execution Time: 0.X ms
```

PostgreSQL performs a **Sequential Scan** — it reads every row in the table one by one and applies the filter manually. The index `idx_salary_department` is completely ignored.

---

## Why the Incorrect Index Order Does Not Help

A composite index in PostgreSQL is stored as a **B-tree** sorted by its columns from left to right. The leftmost column is the primary sort key, and each subsequent column only sorts *within* groups of the previous column.

The index `(salary, department)` organises data like this internally:

```
salary=45000 → Frank (Sales)
salary=48000 → Heidi (HR)
salary=50000 → David (HR)
salary=55000 → Charlie (Sales)
salary=60000 → Alice (Sales)
salary=72000 → Grace (Engineering)
salary=75000 → Bob (Engineering)
salary=80000 → Eve (Engineering)
```

When the query asks `WHERE department = 'Sales'`, PostgreSQL cannot jump to 'Sales' rows — they are scattered across different salary levels throughout the entire index. It would still have to scan every entry. Because that gives no advantage over a plain table scan, the query planner simply skips the index altogether.

**Analogy:** imagine a phone book sorted by first name, then last name. If you want to find everyone with the last name "Smith", the phone book is useless for that lookup — the Smiths are scattered everywhere. You still have to read every page.

---

## Fixed Index

```sql
-- Remove the broken index
DROP INDEX IF EXISTS idx_salary_department;

-- Create the correct index — equality column first, range column second
CREATE INDEX idx_department_salary ON employees(department, salary);
```

**Output after fix:**
```
Index Scan using idx_department_salary on employees  (cost=0.13..8.15 rows=2 width=...)
  Index Cond: (((department)::text = 'Sales') AND (salary > '50000'::numeric))
Planning Time: 0.X ms
Execution Time: 0.X ms
```

PostgreSQL now performs an **Index Scan**. It navigates directly to the `'Sales'` section of the B-tree, then applies `salary > 50000` as a range filter within that section only — examining a tiny fraction of the data.

---

## Performance Improvement

| Scenario | Plan | Rows Examined |
|---|---|---|
| Broken index `(salary, department)` | Seq Scan | All 8 rows |
| Correct index `(department, salary)` | Index Scan | Only matching rows |

On a table with millions of rows the difference is measured in **seconds vs milliseconds**.

---

## The Left-Most Prefix Rule

The **Left-Most Prefix Rule** states:

> PostgreSQL can only use a composite index efficiently when the query's WHERE clause includes the **leftmost column(s)** of the index.

For an index on `(department, salary)`:

| Query | Index Used? | Reason |
|---|---|---|
| `WHERE department = 'Sales'` | ✅ Yes | Matches leading column |
| `WHERE department = 'Sales' AND salary > 50000` | ✅ Yes | Matches both columns in order |
| `WHERE salary > 50000` | ❌ No | Skips the leading column |
| `WHERE salary > 50000 AND department = 'Sales'` | ✅ Yes* | Planner reorders; leading column is still present |

> *PostgreSQL's query planner automatically reorders WHERE conditions, so the physical order you write them in your query does not matter. What matters is which columns are *present* — specifically the leading column must be there.

### Design Rule

- Put **equality-filter columns first** (e.g. `department = 'Sales'`)  
- Put **range-filter columns after** (e.g. `salary > 50000`)

This matches the query's access pattern to the B-tree's sort order, allowing PostgreSQL to jump directly to the right section and scan a minimal number of rows.

---

## Summary

| | Value |
|---|---|
| **Original index** | `(salary, department)` — salary was the leading column |
| **Problem** | Query filtered by `department` first; index was entered from the wrong end |
| **Fix** | `(department, salary)` — equality column leads, range column follows |
| **Rule applied** | Left-Most Prefix Rule — the B-tree can only be entered efficiently from its leading column |