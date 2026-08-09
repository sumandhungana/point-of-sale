package com.puff.tech.usecase.permission.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeletePermissionUseCaseRequest(
        Integer id
) implements UseCase.UseCaseRequest {
}
