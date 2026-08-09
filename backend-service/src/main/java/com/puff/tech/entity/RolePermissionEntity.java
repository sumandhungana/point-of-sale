package com.puff.tech.entity;

import io.micronaut.core.annotation.Generated;
import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Serdeable
@Introspected
@MappedEntity(value = "RolePermissions")
public class RolePermissionEntity {

    @Id
    @Generated
    private Integer id;
    private Integer roleId;
    private Integer permissionId;
    @DateCreated
    private Instant createdAt;
    @DateUpdated
    private Instant updatedAt;

    @Relation(Relation.Kind.MANY_TO_ONE)
    @MappedProperty("role_id")
    private RoleEntity role;
    @Relation(Relation.Kind.MANY_TO_ONE)
    @MappedProperty("role_id")
    private PermissionEntity permission;
}
