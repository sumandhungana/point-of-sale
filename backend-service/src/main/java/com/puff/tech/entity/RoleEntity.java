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
@Serdeable
@Introspected
@MappedEntity(value = "Roles")
public class RoleEntity {

    @Id
    @Generated
    private Integer id;

    private String name;
    private String status;
    private String description;
    @DateCreated
    private Instant createdAt;
    @DateUpdated
    private Instant updatedAt;
    @Relation(Relation.Kind.ONE_TO_MANY)
    private List<RolePermissionEntity> rolePermissions;
}
