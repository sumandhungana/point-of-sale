# Domain Knowledge: Authentication, JWT & RBAC Permissions

## 1. Authentication Architecture

- **Protocol**: Stateless Bearer JWT tokens.
- **Login Flow**:
  1. Frontend submits credentials (`username`, `password`) to `/api/v1/user/login`.
  2. Backend validates password hash against `users` table.
  3. `JwtTokenProvider` issues a signed HMAC/RSA JWT token.
  4. Token is stored in browser `localStorage` as `authToken`.
  5. Frontend attaches `Authorization: Bearer <token>` via `getAuthHeaders()` on every API request.

---

## 2. JWT Claims Payload

```json
{
  "sub": "1001",
  "memberId": 50,
  "username": "cashier1",
  "role": "CASHIER",
  "permissions": [
    "permission:sales_bill:add",
    "permission:sales_bill:view",
    "permission:customer:view"
  ],
  "exp": 1791657600
}
```

---

## 3. Role-Based Access Control (RBAC) Data Model

### `user_roles` Table
- `id`: Primary key.
- `member_id`: Tenant ID.
- `name`: Role name (e.g., `ADMIN`, `STORE_MANAGER`, `CASHIER`, `ACCOUNTANT`).
- `description`: Role responsibilities.
- `status`: `ACTIVE` / `INACTIVE`.

### `user_permissions` Table
- `id`: Primary key.
- `role_id`: Foreign key referencing `user_roles(id)`.
- `module`: Target module string (matches `Module` enum).
- `permissions`: JSONB array of granted permission strings.

---

## 4. Backend Permission Enforcement

### The `@Secured` Annotation:
```java
@Secured(permissions = {Permission.RENTAL_ADD})
@Post
public Mono<RestResponse<...>> addRental(...)
```

### `SecurityInterceptor`:
1. Intercepts incoming requests prior to controller execution.
2. Extracts Bearer token, validates signature and expiration.
3. Decodes `memberId`, `subject`, and user permissions.
4. Checks if the user holds at least one (or all) required permissions declared in `@Secured`.
5. Injects `UserSecurityContext` into Reactor Subscriber Context via `SecurityContextHolder`.
6. If unauthorized: rejects immediately with HTTP 401 or 403.
