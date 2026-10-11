# Skill: Database Migrations & Schema Patching

This skill covers managing PostgreSQL database schemas and migrations in the Point of Sale system.

---

## Architecture Overview

- **Engine**: PostgreSQL 15/16.
- **Dialect**: Reactive R2DBC PostgreSQL.
- **Location of DDL & Patches**: `backend-service/src/main/resources/patch/`
  - `all_ddl_query_patch_beginning.sql`: Base application schema (products, sales_bill, categories, suppliers, etc.)
  - `member.sql`: Tenant organization member definitions
  - `roles_permissions.sql`: User roles and permission matrix
  - `payment.sql`: Cashbook, payment gateway, transaction logs
  - `categories.sql`, `products.sql`, `sales_bill.sql`: Entity DDL patches

---

## Guidelines for Writing Schema Patches

### 1. Primary Keys & Sequences
When defining a new entity using `@GeneratedValue(GeneratedValue.Type.SEQUENCE)`:
1. Always create a dedicated sequence:
   ```sql
   CREATE SEQUENCE IF NOT EXISTS <table_name>_seq
       START WITH 1
       INCREMENT BY 1
       NO MINVALUE
       NO MAXVALUE
       CACHE 1;
   ```
2. Set default value on primary key column:
   ```sql
   id BIGINT PRIMARY KEY DEFAULT nextval('<table_name>_seq')
   ```

### 2. Multi-Tenant Constraints
Every entity tied to a tenant must reference `member(id)`:
```sql
member_id BIGINT NOT NULL,
CONSTRAINT fk_<table_name>_member FOREIGN KEY (member_id) REFERENCES member(id) ON DELETE CASCADE
```
Add index for performance:
```sql
CREATE INDEX idx_<table_name>_member_id ON <table_name>(member_id);
```

### 3. Financial & Precision Types
- Monetary amounts (prices, totals, discounts): Use `NUMERIC(19, 4)` to avoid floating-point rounding errors.
- Quantities: Use `DOUBLE PRECISION` or `NUMERIC(12, 3)`.
- Timestamps: Use `TIMESTAMPTZ` (Timestamp with Time Zone).

---

## Executing Patches Against Docker Database

When running with Docker Compose:
```bash
# Execute patch inside running postgres container
docker compose exec -T postgres psql -U postgres -d khatabook < backend-service/src/main/resources/patch/your_patch.sql
```
Or connect via psql:
```bash
docker compose exec postgres psql -U postgres -d khatabook
```
