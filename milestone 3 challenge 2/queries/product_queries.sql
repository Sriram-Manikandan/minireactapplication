-- ============================================================
-- PRODUCT QUERIES  —  updated for the normalized 3NF schema
-- ============================================================
-- All queries have been rewritten using JOINs where necessary
-- so that the same information is returned as before, but now
-- from a properly normalised set of tables.
-- ============================================================


-- ------------------------------------------------------------
-- Query 1 — Get all products
-- (was: SELECT * FROM products)
-- Now joins suppliers so readable supplier info is included,
-- but products can still be listed individually.
-- ------------------------------------------------------------
SELECT
    p.product_id,
    p.product_name,
    p.price,
    s.supplier_name,
    s.supplier_phone,
    s.supplier_email
FROM products p
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id;


-- ------------------------------------------------------------
-- Query 2 — Find products under a specific category
-- (was: WHERE categories LIKE '%Electronics%')
-- Now uses a JOIN through the product_categories bridge table.
-- Change 'Electronics' to any category_name as needed.
-- ------------------------------------------------------------
SELECT
    p.product_id,
    p.product_name,
    p.price,
    c.category_name
FROM products p
JOIN product_categories pc ON p.product_id = pc.product_id
JOIN categories c           ON pc.category_id = c.category_id
WHERE c.category_name = 'Electronics';


-- ------------------------------------------------------------
-- Query 3 — Find supplier details for a product
-- (was: SELECT product_name, supplier_name, supplier_phone FROM products)
-- Supplier data now lives in the suppliers table; a JOIN is required.
-- ------------------------------------------------------------
SELECT
    p.product_name,
    s.supplier_name,
    s.supplier_phone,
    s.supplier_email
FROM products p
JOIN suppliers s ON p.supplier_id = s.supplier_id;


-- ------------------------------------------------------------
-- Query 4 — Find products with low stock
-- (was: WHERE stock_quantity < 10)
-- Stock data now lives in the inventory table; a JOIN is required.
-- ------------------------------------------------------------
SELECT
    p.product_name,
    i.stock_quantity,
    i.warehouse_location
FROM products p
JOIN inventory i ON p.product_id = i.product_id
WHERE i.stock_quantity < 10;


-- ============================================================
-- BONUS QUERIES  —  made possible by the normalised design
-- ============================================================

-- Bonus A — Full product detail view
-- Returns all product info, categories (as a list), and stock level.
SELECT
    p.product_id,
    p.product_name,
    p.price,
    GROUP_CONCAT(DISTINCT c.category_name ORDER BY c.category_name SEPARATOR ', ') AS categories,
    GROUP_CONCAT(DISTINCT t.tag_name      ORDER BY t.tag_name      SEPARATOR ', ') AS tags,
    s.supplier_name,
    i.stock_quantity,
    i.warehouse_location
FROM products p
LEFT JOIN suppliers         s  ON p.product_id  = s.supplier_id
LEFT JOIN product_categories pc ON p.product_id = pc.product_id
LEFT JOIN categories         c  ON pc.category_id = c.category_id
LEFT JOIN product_tags       pt ON p.product_id  = pt.product_id
LEFT JOIN tags               t  ON pt.tag_id     = t.tag_id
LEFT JOIN inventory          i  ON p.product_id  = i.product_id
GROUP BY
    p.product_id, p.product_name, p.price,
    s.supplier_name, i.stock_quantity, i.warehouse_location;


-- Bonus B — Find all products tagged 'bestseller'
SELECT
    p.product_id,
    p.product_name,
    p.price
FROM products p
JOIN product_tags pt ON p.product_id = pt.product_id
JOIN tags        t  ON pt.tag_id    = t.tag_id
WHERE t.tag_name = 'bestseller';


-- Bonus C — Count products per category
SELECT
    c.category_name,
    COUNT(pc.product_id) AS product_count
FROM categories c
LEFT JOIN product_categories pc ON c.category_id = pc.category_id
GROUP BY c.category_name
ORDER BY product_count DESC;