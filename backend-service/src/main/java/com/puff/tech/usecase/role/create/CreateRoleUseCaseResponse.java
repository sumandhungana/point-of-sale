package com.puff.tech.usecase.role.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateRoleUseCaseResponse(
        String message
)implements UseCase.UseCaseResponse {
}
