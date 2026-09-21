package com.puff.tech.usecase.permission.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreatePermissionUseCaseRequest(
        String module,
        String permissionName
)
implements UseCases.UseCaseRequest {
}
