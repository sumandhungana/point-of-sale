package com.puff.tech.usecase.role.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateRoleUseCaseRequest(
        String name,
        String status,
        String description
) implements UseCase.UseCaseRequest {
}
