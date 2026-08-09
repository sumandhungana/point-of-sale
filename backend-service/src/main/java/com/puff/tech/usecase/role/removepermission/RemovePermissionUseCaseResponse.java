package com.puff.tech.usecase.role.removepermission;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record RemovePermissionUseCaseResponse(
        String message
)
implements UseCase.UseCaseResponse {
}
