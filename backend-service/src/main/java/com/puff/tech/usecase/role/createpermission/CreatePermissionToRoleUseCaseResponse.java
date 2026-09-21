package com.puff.tech.usecase.role.createpermission;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreatePermissionToRoleUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
