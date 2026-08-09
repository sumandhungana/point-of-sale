package com.puff.tech.usecase.user.add;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record AddUserUseCaseResponse(
        String message,
        Integer userId
)
implements UseCase.UseCaseResponse {
}
