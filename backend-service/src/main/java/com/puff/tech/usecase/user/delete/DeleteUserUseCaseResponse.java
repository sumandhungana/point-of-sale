package com.puff.tech.usecase.user.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteUserUseCaseResponse(
        String message
)implements UseCase.UseCaseResponse {
}
