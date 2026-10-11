# General Engineering Rules

These rules apply across the entire repository (frontend, backend-service, and infrastructure).

---

## 1. Clean Code & Architecture Principles

- **Separation of Concerns**: Keep presentation, business logic, and data access decoupled.
- **Do Not Break Multi-Tenancy**: The entire system is multi-tenant based on `MemberEntity` (`member_id`). Every entity belonging to an organization must link to a `member_id`. Queries must always filter by `member_id` from the security context to prevent cross-tenant data leaks.
- **Fail Fast & Explicit Errors**: Never swallow exceptions silently. Log informative error messages with context.
- **Atomic Operations**: Financial transactions (bills, payments, stock updates) must be transactional (`@Transactional` in backend).
- **Preserve Comments & Docstrings**: When editing existing code, maintain all existing comments and documentation unless explicitly modifying that behavior.

---

## 2. API Contract Standards

- **Uniform Response Format**: All REST endpoints must return `RestResponse<T>`:
  ```json
  {
    "code": 0,
    "message": "SUCCESS",
    "data": { ... }
  }
  ```
  - Code `0`: Success.
  - Code `-1` (or non-zero): Error with descriptive `message`.
- **Context Path**: Backend APIs are served under `/api/v1`.
- **Date/Time Formatting**: Use ISO-8601 strings across API boundaries (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`).

---

## 3. Git & Environment Hygiene

- **Sensitive Data**: Never commit secrets, database passwords, or JWT signing keys to version control. Use `.env` or container environment variables.
- **Line Endings**: Unix LF line endings are mandatory for shell scripts (`entrypoint.sh`, `gradlew`) to prevent container runtime errors on Linux.
- **Docker Reproducibility**: Keep `.dockerignore` updated so local `node_modules`, `.gradle`, or compiled `build` folders are not copied into build stages.
