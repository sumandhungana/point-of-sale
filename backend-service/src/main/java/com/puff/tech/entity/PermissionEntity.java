package com.puff.tech.entity;

import io.micronaut.core.annotation.Generated;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Introspected
@Serdeable
@MappedEntity(value = "Permissions")
public class PermissionEntity {
    @Id
    @Generated
    private Integer id;
    private String module;
    private String permissionName;
    @DateCreated
    private Instant createdAt;
    @DateUpdated
    private Instant updatedAt;
    @Relation(Relation.Kind.ONE_TO_MANY)
    private List<RolePermissionEntity> rolePermissions;
}
