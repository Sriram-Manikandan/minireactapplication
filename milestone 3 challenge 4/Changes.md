# Document Your Index Fixes Here

## Original Index

```sql
CREATE INDEX idx_salary_department ON employees(salary, department);
```

---

## Issue Observed

Running the query with `EXPLAIN ANALYZE` against the broken index:

```sql
EXPLAIN ANALYZE
SELECT *
FROM employees
WHERE department = 'Sales'
AND salary > 50000;
```

**Actual output (broken index — Step 1):**
```
Index Scan using idx_salary_department on employees
  (cost=0.14..8.82 rows=1 width=376) (actual time=0.109..0.111 rows=2.00 loops=1)
  Index Cond: ((salary > '50000'::numeric) AND ((department)::text = 'Sales'::text))
  Planning Time: 1.282 ms
  Execution Time: 0.391 ms
```

PostgreSQL 18 used the index on this 8-row table, but notice the index condition —
it is applying both filters after entering the index from the `salary` side.
This is structurally wrong. On a large table (100,000+ rows), PostgreSQL would
ignore this index entirely and fall back to a Sequential Scan, because `department`
is not the leading column and the planner knows it cannot efficiently narrow rows by it.

**Actual output (wrong index recreated as `idx_wrong_order` — Step 2):**
```
Seq Scan on employees
  (cost=0.00..1.12 rows=1 width=376) (actual time=0.012..0.014 rows=2.00 loops=1)
  Filter: ((salary > '50000'::numeric) AND ((department)::text = 'Sales'::text))
  Rows Removed by Filter: 6
  Planning Time: 0.322 ms
  Execution Time: 0.025 ms
```

With a freshly created wrong-order index, PostgreSQL correctly chose a Sequential Scan.
It read all 8 rows and discarded 6 — a full table scan with no index benefit.

---

## Why the Incorrect Index Order Does Not Help

A composite index in PostgreSQL is a **B-tree sorted from left to right**.
The leftmost column is the primary sort key. Each subsequent column only sorts
*within groups* of the previous column.

The index `(salary, department)` organises data like this internally:

```
salary=45000 → Frank   (Sales)
salary=48000 → Heidi   (HR)
salary=50000 → David   (HR)
salary=55000 → Charlie (Sales)
salary=60000 → Alice   (Sales)
salary=72000 → Grace   (Engineering)
salary=75000 → Bob     (Engineering)
salary=80000 → Eve     (Engineering)
```

When the query asks `WHERE department = 'Sales'`, PostgreSQL cannot jump to
'Sales' rows — they are scattered across different salary levels throughout
the entire index. The planner gets no benefit from using it, so it falls
back to a Sequential Scan.

**Analogy:** imagine a phone book sorted by first name, then last name.
If you want everyone with the last name "Smith", the book is useless —
the Smiths are spread across every section. You still read every page.

---

## Fixed Index

```sql
DROP INDEX IF EXISTS idx_wrong_order;

CREATE INDEX idx_department_salary ON employees(department, salary);
```

**Actual output after fix (Step 4):**
```
Seq Scan on employees
  (cost=0.00..1.12 rows=1 width=376) (actual time=0.005..0.008 rows=2.00 loops=1)
  Filter: ((salary > '50000'::numeric) AND ((department)::text = 'Sales'::text))
  Rows Removed by Filter: 6
  Planning Time: 0.194 ms
  Execution Time: 0.015 ms
```

PostgreSQL still shows a Seq Scan here — because the table only has 8 rows.
With such a small dataset, the query planner correctly determines that reading
8 rows sequentially is cheaper than the overhead of an index lookup.
**This is normal and expected behaviour, not a failure of the index.**

The index is correctly structured and confirmed in place:

```
indexname             | indexdef
----------------------|-----------------------------------------------------------------------
idx_department_salary | CREATE INDEX idx_department_salary ON employees(department, salary)
```

On a production table with 100,000+ rows, this correct index produces an
**Index Scan** — PostgreSQL jumps directly to the 'Sales' section of the
B-tree, then applies `salary > 50000` as a range filter within that section only,
examining a tiny fraction of the data instead of every row.

---

## Performance Improvement

| Scenario | Plan | Rows Examined |
|---|---|---|
| Broken index `(salary, department)` | Index Scan (structurally wrong) | All matching salary entries |
| Wrong index `idx_wrong_order(salary, department)` | Seq Scan | All 8 rows |
| Correct index `(department, salary)` — small table | Seq Scan (planner optimised) | All 8 rows |
| Correct index `(department, salary)` — large table | **Index Scan** | Only matching rows |

At scale, the difference between a Sequential Scan and a correct Index Scan
is the difference between **seconds and milliseconds**.

---

## The Left-Most Prefix Rule

The **Left-Most Prefix Rule** states:

> PostgreSQL can only use a composite index efficiently when the query's
> WHERE clause includes the **leftmost column** of the index.

For an index on `(department, salary)`:

| Query Filter | Index Used? | Reason |
|---|---|---|
| `WHERE department = 'Sales'` | ✅ Yes | Matches leading column |
| `WHERE department = 'Sales' AND salary > 50000` | ✅ Yes | Matches both columns in order |
| `WHERE salary > 50000` | ❌ No | Skips the leading column |
| `WHERE salary > 50000 AND department = 'Sales'` | ✅ Yes* | Planner reorders; leading column is present |

> *PostgreSQL's query planner automatically reorders WHERE conditions,
> so the order you write them in your query does not matter.
> What matters is that the leading column is **present** in the filter.

### Design Rule

- Put **equality-filter columns first** → `department = 'Sales'`
- Put **range-filter columns after** → `salary > 50000`

This matches the query's access pattern to the B-tree's sort order,
allowing PostgreSQL to jump directly to the right section and scan
the minimum number of rows.

---

## Summary

| | Detail |
|---|---|
| **Original index** | `(salary, department)` — salary was the leading column |
| **Problem** | Query filtered by `department` first; the index was entered from the wrong end |
| **Observation** | On 8 rows PostgreSQL sometimes used the broken index anyway; on large tables it would Seq Scan |
| **Fix** | `(department, salary)` — equality column leads, range column follows |
| **Why planner chose Seq Scan after fix** | 8-row table is too small to justify index overhead — correct and expected |
| **Rule applied** | Left-Most Prefix Rule — the B-tree can only be entered efficiently from its leading column |