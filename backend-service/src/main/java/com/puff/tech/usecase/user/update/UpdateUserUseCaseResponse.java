package com.puff.tech.usecase.user.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateUserUseCaseResponse(
        String message,
        Integer userId
)
implements UseCase.UseCaseResponse {
}
