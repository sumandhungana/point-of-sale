package com.puff.tech.usecase.permission.get;

import com.puff.tech.core.usecases.UseCases;
import com.puff.tech.entity.RolePermissionEntity;
import jakarta.inject.Singleton;

import java.time.Instant;
import java.util.List;

@Singleton
public record GetPermissionUseCaseResponse(
        Integer id,
        String module,
        String permissionName,
        Instant createdAt,
        Instant updatedAt,
        List<RolePermissionEntity> rolePermissions
)
implements UseCases.UseCaseResponse {
}
