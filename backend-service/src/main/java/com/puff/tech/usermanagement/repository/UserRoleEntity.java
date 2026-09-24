package com.puff.tech.usermanagement.repository;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.data.annotation.*;
import io.micronaut.serde.annotation.Serdeable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Serdeable
@Introspected
@MappedEntity(value = "user_roles")
public class UserRoleEntity {

    @Id
    @GeneratedValue(GeneratedValue.Type.IDENTITY)
    private Integer id;

    private Long memberId;

    private String name;

    private String description;

    private String status; // ACTIVE, INACTIVE

    @DateCreated
    private Instant createdAt;

    @DateUpdated
    private Instant updatedAt;

    @Relation(value = Relation.Kind.ONE_TO_MANY, mappedBy = "role", cascade = Relation.Cascade.ALL)
    private List<UserPermissionEntity> permissions = new ArrayList<>();
}
