-- ============================================================
-- NORMALIZED DATABASE SCHEMA — Third Normal Form (3NF)
-- ============================================================
-- Original problems fixed:
--   1NF: categories and product_tags stored as comma-separated strings → split into proper tables
--   2NF: supplier info embedded inside products → moved to dedicated suppliers table
--   3NF: inventory info (warehouse_location, stock_quantity) mixed with product info → moved to inventory table
-- ============================================================


-- ------------------------------------------------------------
-- TABLE: suppliers
-- Stores supplier contact information independently.
-- Removed from products table (was a 2NF violation).
-- ------------------------------------------------------------
CREATE TABLE suppliers (
    supplier_id   INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(100) NOT NULL,
    supplier_phone VARCHAR(20),
    supplier_email VARCHAR(100)
);


-- ------------------------------------------------------------
-- TABLE: products
-- Stores only core product attributes.
-- supplier_id is a FK — supplier details live in suppliers.
-- categories, tags, and inventory are all in separate tables.
-- ------------------------------------------------------------
CREATE TABLE products (
    product_id   INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    price        DECIMAL(10, 2),
    supplier_id  INT,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);


-- ------------------------------------------------------------
-- TABLE: categories
-- Each category is one row — no more comma-separated strings.
-- Fixes the 1NF violation in the original categories column.
-- ------------------------------------------------------------
CREATE TABLE categories (
    category_id   INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE
);


-- ------------------------------------------------------------
-- TABLE: product_categories  (junction / bridge table)
-- Many-to-many: one product can belong to many categories,
-- one category can contain many products.
-- ------------------------------------------------------------
CREATE TABLE product_categories (
    product_id  INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id)  REFERENCES products(product_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);


-- ------------------------------------------------------------
-- TABLE: tags
-- Each tag is one row — no more comma-separated strings.
-- Fixes the 1NF violation in the original product_tags column.
-- ------------------------------------------------------------
CREATE TABLE tags (
    tag_id   INT PRIMARY KEY AUTO_INCREMENT,
    tag_name VARCHAR(100) NOT NULL UNIQUE
);


-- ------------------------------------------------------------
-- TABLE: product_tags  (junction / bridge table)
-- Many-to-many: one product can have many tags,
-- one tag can apply to many products.
-- ------------------------------------------------------------
CREATE TABLE product_tags (
    product_id INT NOT NULL,
    tag_id     INT NOT NULL,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (tag_id)     REFERENCES tags(tag_id)
);


-- ------------------------------------------------------------
-- TABLE: inventory
-- Stores stock and warehouse data separately from products.
-- Fixes the 3NF violation — inventory facts depend on a
-- warehouse/location concept, not purely on product identity.
-- ------------------------------------------------------------
CREATE TABLE inventory (
    inventory_id       INT PRIMARY KEY AUTO_INCREMENT,
    product_id         INT NOT NULL UNIQUE,   -- one inventory record per product
    warehouse_location VARCHAR(100),
    stock_quantity     INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);


-- ============================================================
-- SAMPLE DATA  (mirrors what the broken schema would have held)
-- ============================================================

INSERT INTO suppliers (supplier_name, supplier_phone, supplier_email) VALUES
    ('TechWorld Supplies', '9876543210', 'contact@techworld.com'),
    ('GadgetHub',          '9123456780', 'sales@gadgethub.com'),
    ('HomeEssentials Co.', '9000011122', 'info@homeessentials.com');

INSERT INTO products (product_name, price, supplier_id) VALUES
    ('Wireless Mouse',    25.99, 1),
    ('Smartphone X12',   499.99, 2),
    ('Bluetooth Speaker', 59.99, 1),
    ('Coffee Maker',      39.99, 3);

INSERT INTO categories (category_name) VALUES
    ('Electronics'),
    ('Mobile'),
    ('Gadgets'),
    ('Home Appliances');

INSERT INTO product_categories (product_id, category_id) VALUES
    (1, 1),   -- Wireless Mouse → Electronics
    (1, 3),   -- Wireless Mouse → Gadgets
    (2, 1),   -- Smartphone X12 → Electronics
    (2, 2),   -- Smartphone X12 → Mobile
    (2, 3),   -- Smartphone X12 → Gadgets
    (3, 1),   -- Bluetooth Speaker → Electronics
    (3, 3),   -- Bluetooth Speaker → Gadgets
    (4, 4);   -- Coffee Maker → Home Appliances

INSERT INTO tags (tag_name) VALUES
    ('wireless'),
    ('bestseller'),
    ('new-arrival'),
    ('sale'),
    ('premium');

INSERT INTO product_tags (product_id, tag_id) VALUES
    (1, 1),   -- Wireless Mouse: wireless
    (1, 2),   -- Wireless Mouse: bestseller
    (2, 3),   -- Smartphone X12: new-arrival
    (2, 5),   -- Smartphone X12: premium
    (3, 1),   -- Bluetooth Speaker: wireless
    (3, 4),   -- Bluetooth Speaker: sale
    (4, 2);   -- Coffee Maker: bestseller

INSERT INTO inventory (product_id, warehouse_location, stock_quantity) VALUES
    (1, 'Warehouse A - Shelf 3',  50),
    (2, 'Warehouse B - Shelf 1',   8),
    (3, 'Warehouse A - Shelf 7',  30),
    (4, 'Warehouse C - Shelf 2',   5);