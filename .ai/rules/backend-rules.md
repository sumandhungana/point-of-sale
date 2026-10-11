# Backend Architecture & Coding Rules

The `backend-service` is built with **Micronaut 4.6.1**, **Java 21**, **Project Reactor (`Mono` / `Flux`)**, and **R2DBC (PostgreSQL)** following Clean Architecture.

---

## 1. Project Reactor & Non-Blocking Rules

1. **Never Block in the Reactive Pipeline**:
   - Do NOT call `.block()`, `.toStream()`, or `Thread.sleep()` inside controllers, services, or use cases.
   - All repository and use case methods must return `Mono<T>` or `Flux<T>`.
2. **Context Propagation**:
   - `SecurityContextHolder.getUseCaseContext()` provides the authenticated tenant context (`memberId`, user ID, permissions).
   - Use `MonoUC.execute(request)` default method to automatically resolve and propagate `UseCaseContext`.
3. **Error Handling**:
   - In controllers, use `.onErrorResume(err -> Mono.just(RestResponse.error("... " + err.getLocalizedMessage())))` to convert failures into standardized error responses.

---

## 2. Clean Architecture & Use Case Pattern

Every business operation must be implemented as a dedicated Use Case class:

### Request and Response Objects
- Define requests and responses as Java `record`s implementing `UCRequest` and `UCResponse`:
```java
@Serdeable
public record AddRentalUCRequest(
    String rentalItemName,
    String phoneNumber,
    BigDecimal rentalAmount
) implements UCRequest {}

@Serdeable
public record AddRentalUCResponse(
    Long id,
    String rentalItemName
) implements UCResponse {}
```

### Use Case Implementation
- Annotate with `@Singleton`.
- Implement `MonoUC<Request, Response>` or `FluxUC<Request, Response>`.
- Use `@Transactional` on the `execute(request, context)` method if mutating data.
```java
@Singleton
public class AddRentalUC implements MonoUC<AddRentalUCRequest, AddRentalUCResponse> {
    private final RentalItemRepository repository;

    public AddRentalUC(RentalItemRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Mono<AddRentalUCResponse> execute(AddRentalUCRequest request, UseCaseContext context) {
        RentalItemEntity entity = buildEntity(request, context);
        return repository.save(entity).map(this::toResponse);
    }
}
```

---

## 3. Controller Guidelines

- **Annotations**:
  - `@Controller("<endpoint-path>")`
  - Method annotations: `@Post`, `@Get`, `@Put`, `@Delete`
  - Request body: `@Body <RequestRecord> payload`
- **Security**:
  - Always secure endpoints with `@Secured(permissions = {Permission.<PERMISSION_NAME>})`.
- **Response Format**:
  - Return `Mono<RestResponse<ResponseType>>`.
  - Wrap results with `RestResponse.success(...)` and errors with `RestResponse.error(...)`.

```java
@Controller("rental")
public class RentalItemController {
    private final AddRentalUC addRentalUC;

    public RentalItemController(AddRentalUC addRentalUC) {
        this.addRentalUC = addRentalUC;
    }

    @Secured(permissions = {Permission.RENTAL_ADD})
    @Post
    public Mono<RestResponse<AddRentalUCResponse>> addRental(@Body AddRentalUCRequest payload) {
        return addRentalUC.execute(payload)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error: " + err.getLocalizedMessage())));
    }
}
```

---

## 4. Entity & Repository Conventions

- **Entity Annotations**:
  - `@MappedEntity("<snake_case_table_name>")`
  - `@Id` with `@GeneratedValue(GeneratedValue.Type.SEQUENCE)` (matching database sequences).
  - Multi-tenant foreign key:
    ```java
    @Relation(value = Relation.Kind.MANY_TO_ONE)
    @MappedProperty("member_id")
    private MemberEntity member;
    ```
  - Audit fields: `createdAt`, `createdBy`, `updatedAt`, `updatedBy`.
- **Repositories**:
  - Extend `ReactorCrudRepository<Entity, Long>` or `R2dbcRepository<Entity, Long>`.
  - Always query filtered by `member.id`:
    ```java
    Flux<RentalItemEntity> findByMemberId(Long memberId);
    ```

---

## 5. Security & Authorization

- JWT tokens contain:
  - `sub`: User ID
  - `memberId`: Tenant ID
  - `roles`: Role name
  - `permissions`: List of granted permissions
- `SecurityInterceptor` validates permissions against `@Secured` metadata before invocation.
- Never hardcode user permissions; always reference `com.puff.tech.usermanagement.enums.Permission`.
