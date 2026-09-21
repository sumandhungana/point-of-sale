package com.puff.tech.usermanagement.usecase.user.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteUserUseCaseResponse(
        String message
)implements UseCases.UseCaseResponse {
}
