package com.puff.tech.usecase.role.get;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.entity.RolePermissionEntity;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;
import java.util.List;

@Serdeable
public record GetRoleUseCaseResponse(
        Integer id,
        String name,
        String status,
        String description,
        Instant createdAt,
        Instant updatedAt,
        List<RolePermissionEntity> rolePermissionEntity
)
implements UseCases.UseCaseResponse {
}
