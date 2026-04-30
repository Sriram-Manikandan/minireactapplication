-- ================================================================
-- queries.sql — Composite Index Order Investigation
-- Run each step in order inside psql
-- ================================================================


-- ================================================================
-- STEP 1: Run the query AS-IS with the broken index
--         (idx_salary_department leads with salary — wrong!)
-- ================================================================

EXPLAIN ANALYZE
SELECT *
FROM employees
WHERE department = 'Sales'
AND salary > 50000;

-- Expected result: Seq Scan on employees
-- PostgreSQL ignores the index because department is NOT the
-- leading column. It must read every row.


-- ================================================================
-- STEP 2: Check what indexes currently exist on the table
-- ================================================================

SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'employees';

-- You will see:  idx_salary_department  ON employees(salary, department)
-- This is the broken index.


-- ================================================================
-- STEP 3: Drop the broken index and confirm it was wrong
--         by intentionally recreating it the SAME wrong way
-- ================================================================

DROP INDEX IF EXISTS idx_salary_department;

CREATE INDEX idx_wrong_order ON employees(salary, department);

EXPLAIN ANALYZE
SELECT *
FROM employees
WHERE department = 'Sales'
AND salary > 50000;

-- Still a Seq Scan. Proving that salary-first is useless
-- for a query that filters on department first.


-- ================================================================
-- STEP 4: Drop the wrong index. Create the CORRECT index.
--         department (equality filter) MUST come first.
--         salary (range filter) comes second.
-- ================================================================

DROP INDEX IF EXISTS idx_wrong_order;

CREATE INDEX idx_department_salary ON employees(department, salary);

EXPLAIN ANALYZE
SELECT *
FROM employees
WHERE department = 'Sales'
AND salary > 50000;

-- NOW you will see: Index Scan using idx_department_salary
-- PostgreSQL jumps straight to 'Sales' in the B-tree,
-- then applies salary > 50000 within that subtree only.


-- ================================================================
-- STEP 5: Test the second query from the repo — same index works
-- ================================================================

EXPLAIN ANALYZE
SELECT *
FROM employees
WHERE department = 'Engineering'
AND salary >= 70000;

-- Also uses idx_department_salary — same left-most prefix pattern.


-- ================================================================
-- STEP 6: Confirm the final correct index is in place
-- ================================================================

SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'employees';

-- You should see: idx_department_salary ON employees(department, salary)