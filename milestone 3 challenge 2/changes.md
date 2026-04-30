# Database Normalization Changes
## "When Clean Design Gets Complex" — Video Walkthrough Guide

---

## What We Started With

The original `broken_schema.sql` had a single `products` table that tried to do everything:

```sql
CREATE TABLE products (
    product_id        INT PRIMARY KEY,
    product_name      VARCHAR(100),
    categories        VARCHAR(255),   -- "Electronics, Mobile, Gadgets"
    supplier_name     VARCHAR(100),
    supplier_phone    VARCHAR(20),
    supplier_email    VARCHAR(100),
    product_tags      VARCHAR(255),   -- "wireless, bestseller, new-arrival"
    price             DECIMAL(10,2),
    warehouse_location VARCHAR(100),
    stock_quantity    INT
);
```

---

## Problems Identified

### Problem 1 — 1NF Violation: Multi-valued `categories` column
- **What it was:** `"Electronics, Mobile, Gadgets"` stored as one string
- **Why it's bad:** You can't query a single category without LIKE hacks; adding/removing a category means string manipulation; no referential integrity
- **Fix:** Created a `categories` table and a `product_categories` junction table

### Problem 2 — 1NF Violation: Multi-valued `product_tags` column
- **What it was:** `"wireless, bestseller, new-arrival"` stored as one string
- **Why it's bad:** Same issues as categories — impossible to index, filter, or enforce consistency
- **Fix:** Created a `tags` table and a `product_tags` junction table

### Problem 3 — 2NF Violation: Supplier info embedded in products
- **What it was:** `supplier_name`, `supplier_phone`, `supplier_email` stored directly on every product row
- **Why it's bad:** If a supplier changes their phone number, every product row must be updated; data is duplicated for every product from the same supplier
- **Fix:** Created a dedicated `suppliers` table; products now hold only a `supplier_id` foreign key

### Problem 4 — 3NF Violation: Inventory info mixed with product info
- **What it was:** `warehouse_location` and `stock_quantity` stored alongside product attributes
- **Why it's bad:** Inventory changes constantly and is operationally separate from product data; mixing them makes both harder to manage
- **Fix:** Created a dedicated `inventory` table linked to products by `product_id`

---

## The New Schema (6 Tables)

```
suppliers
├── supplier_id  (PK)
├── supplier_name
├── supplier_phone
└── supplier_email

products
├── product_id   (PK)
├── product_name
├── price
└── supplier_id  (FK → suppliers)

categories
├── category_id  (PK)
└── category_name

product_categories  ← junction table
├── product_id   (FK → products)
└── category_id  (FK → categories)

tags
├── tag_id       (PK)
└── tag_name

product_tags        ← junction table
├── product_id   (FK → products)
└── tag_id       (FK → tags)

inventory
├── inventory_id (PK)
├── product_id   (FK → products)
├── warehouse_location
└── stock_quantity
```

---

## Query Changes

### Query 1 — Get all products

**Before:**
```sql
SELECT * FROM products;
```

**After:**
```sql
SELECT p.product_id, p.product_name, p.price,
       s.supplier_name, s.supplier_phone, s.supplier_email
FROM products p
LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id;
```
> Why: supplier info no longer lives in the products table.

---

### Query 2 — Find products by category

**Before:**
```sql
SELECT * FROM products
WHERE categories LIKE '%Electronics%';
```

**After:**
```sql
SELECT p.product_id, p.product_name, p.price, c.category_name
FROM products p
JOIN product_categories pc ON p.product_id = pc.product_id
JOIN categories c ON pc.category_id = c.category_id
WHERE c.category_name = 'Electronics';
```
> Why: categories are now in their own table; an exact match replaces the fragile LIKE.

---

### Query 3 — Supplier details for a product

**Before:**
```sql
SELECT product_name, supplier_name, supplier_phone
FROM products;
```

**After:**
```sql
SELECT p.product_name, s.supplier_name, s.supplier_phone
FROM products p
JOIN suppliers s ON p.supplier_id = s.supplier_id;
```
> Why: supplier columns were removed from products; a JOIN is now required.

---

### Query 4 — Products with low stock

**Before:**
```sql
SELECT product_name, stock_quantity
FROM products
WHERE stock_quantity < 10;
```

**After:**
```sql
SELECT p.product_name, i.stock_quantity, i.warehouse_location
FROM products p
JOIN inventory i ON p.product_id = i.product_id
WHERE i.stock_quantity < 10;
```
> Why: stock data now lives in the inventory table.

---

## Trade-offs to Mention in the Video

| Benefit | Trade-off |
|---|---|
| No duplicate supplier data | Queries need JOINs |
| Categories are queryable and indexed | Slightly more complex schema |
| Inventory updates don't touch product rows | More tables to maintain |
| Adding a new category is one INSERT | Application code must handle relationships |

The key engineering insight: **the JOINs are a worthwhile cost** because the data is now consistent, maintainable, and scalable.

---

## Files Changed

| File | Action |
|---|---|
| `schema/broken_schema.sql` | Original (do not modify) |
| `schema/normalized_schema.sql` | **Created** — full 3NF schema with sample data |
| `queries/product_queries.sql` | **Updated** — all 4 queries rewritten with JOINs |