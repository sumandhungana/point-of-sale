package com.puff.tech.usecase.role.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteRoleUseCaseResponse(
        String message
)
implements UseCases.UseCaseResponse {
}
