package com.puff.tech.usecase.permission.update;

import com.puff.tech.core.usecases.UseCases;
import jakarta.inject.Singleton;

@Singleton
public record UpdatePermissionUseCaseRequest(
        Integer id,
        String module,
        String permissionName
) implements UseCases.UseCaseRequest {
}
