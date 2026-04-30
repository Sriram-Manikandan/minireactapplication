-- Create employees table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(50),
    salary NUMERIC,
    hire_date DATE
);

-- BROKEN composite index (wrong column order)
-- Leading column is salary, but our query filters by department first
CREATE INDEX idx_salary_department ON employees(salary, department);