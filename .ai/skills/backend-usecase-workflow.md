# Skill: Backend Use Case Implementation Workflow

This skill outlines the standard step-by-step procedure for creating a new backend feature or endpoint in `backend-service`.

---

## Workflow Steps

### Step 1: Define Database Table & Sequence (if new entity)
1. Add DDL queries into `src/main/resources/patch/`.
2. Create sequence for ID generation:
   ```sql
   CREATE SEQUENCE IF NOT EXISTS example_item_seq START WITH 1 INCREMENT BY 1;
   ```
3. Create table with multi-tenant `member_id` foreign key:
   ```sql
   CREATE TABLE example_item (
       id BIGINT PRIMARY KEY DEFAULT nextval('example_item_seq'),
       member_id BIGINT NOT NULL REFERENCES member(id) ON DELETE CASCADE,
       name VARCHAR(255) NOT NULL,
       amount NUMERIC(19, 4) NOT NULL,
       created_at TIMESTAMPTZ NOT NULL,
       created_by VARCHAR(255)
   );
   ```

### Step 2: Create Entity
Location: `src/main/java/com/puff/tech/<module>/repository/<EntityName>.java`
```java
@Serdeable
@MappedEntity("example_item")
@Data
public class ExampleItemEntity {
    @Id
    @GeneratedValue(GeneratedValue.Type.SEQUENCE)
    private Long id;

    @Relation(value = Relation.Kind.MANY_TO_ONE)
    @MappedProperty("member_id")
    private MemberEntity member;

    private String name;
    private BigDecimal amount;
    private Instant createdAt;
    private String createdBy;
}
```

### Step 3: Create R2DBC Repository
Location: `src/main/java/com/puff/tech/<module>/repository/<EntityName>Repository.java`
```java
@R2dbcRepository(dialect = Dialect.POSTGRES)
public interface ExampleItemRepository extends ReactorCrudRepository<ExampleItemEntity, Long> {
    Flux<ExampleItemEntity> findByMemberId(Long memberId);
}
```

### Step 4: Register Permissions
In `com.puff.tech.usermanagement.enums.Permission`:
```java
EXAMPLE_ITEM_ADD(Module.EXAMPLE, "Add Example Item", "permission:example:add"),
EXAMPLE_ITEM_GET(Module.EXAMPLE, "Get Example Items", "permission:example:get");
```

### Step 5: Define Request & Response Records
Location: `src/main/java/com/puff/tech/<module>/usecase/<operation>/`
```java
@Serdeable
public record AddExampleUCRequest(
    String name,
    BigDecimal amount
) implements UCRequest {}

@Serdeable
public record AddExampleUCResponse(
    Long id,
    String name
) implements UCResponse {}
```

### Step 6: Implement Use Case
Location: `src/main/java/com/puff/tech/<module>/usecase/<operation>/AddExampleUC.java`
```java
@Singleton
public class AddExampleUC implements MonoUC<AddExampleUCRequest, AddExampleUCResponse> {
    private final ExampleItemRepository repository;

    public AddExampleUC(ExampleItemRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public Mono<AddExampleUCResponse> execute(AddExampleUCRequest request, UseCaseContext context) {
        ExampleItemEntity entity = new ExampleItemEntity();
        entity.setName(request.name());
        entity.setAmount(request.amount());
        entity.setCreatedAt(Instant.now());

        if (context != null && context.securityContext() != null) {
            MemberEntity member = new MemberEntity();
            member.setId(context.securityContext().memberId());
            entity.setMember(member);
            entity.setCreatedBy(context.securityContext().subject());
        }

        return repository.save(entity)
                .map(saved -> new AddExampleUCResponse(saved.getId(), saved.getName()));
    }
}
```

### Step 7: Expose Controller Endpoint
Location: `src/main/java/com/puff/tech/<module>/controller/<Module>Controller.java`
```java
@Controller("example")
public class ExampleController {
    private final AddExampleUC addExampleUC;

    public ExampleController(AddExampleUC addExampleUC) {
        this.addExampleUC = addExampleUC;
    }

    @Secured(permissions = {Permission.EXAMPLE_ITEM_ADD})
    @Post
    public Mono<RestResponse<AddExampleUCResponse>> add(@Body AddExampleUCRequest payload) {
        return addExampleUC.execute(payload)
                .map(RestResponse::success)
                .onErrorResume(err -> Mono.just(RestResponse.error("Error: " + err.getLocalizedMessage())));
    }
}
```

### Step 8: Build Verification
Run inside `backend-service`:
```bash
./gradlew clean build -x test --no-daemon
```
