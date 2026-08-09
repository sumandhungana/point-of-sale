package com.puff.tech.usecase.role.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteRoleUseCaseRequest(
        Integer id
)
implements UseCase.UseCaseRequest {
}
