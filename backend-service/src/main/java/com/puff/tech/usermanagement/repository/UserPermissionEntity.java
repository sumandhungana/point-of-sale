package com.puff.tech.usermanagement.repository;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.data.model.DataType;
import io.micronaut.serde.annotation.Serdeable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Serdeable
@Introspected
@MappedEntity(value = "user_permissions")
public class UserPermissionEntity {

    @Id
    @GeneratedValue(GeneratedValue.Type.IDENTITY)
    private Integer id;

    // Many-To-One relation back to UserRoleEntity
    @Relation(Relation.Kind.MANY_TO_ONE)
    private UserRoleEntity role;

    @TypeDef(type = DataType.JSON)
    private List<String> permissions;// e.g., "user:create", "customer:create"

    private String module; // e.g., "user", "customer"

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;
}
