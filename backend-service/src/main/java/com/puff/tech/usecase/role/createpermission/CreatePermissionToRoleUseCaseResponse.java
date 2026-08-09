package com.puff.tech.usecase.role.createpermission;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreatePermissionToRoleUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
