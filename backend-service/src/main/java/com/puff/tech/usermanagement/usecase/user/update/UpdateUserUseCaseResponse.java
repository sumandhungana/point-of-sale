package com.puff.tech.usermanagement.usecase.user.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateUserUseCaseResponse(
        String message,
        Integer userId
)
implements UseCases.UseCaseResponse {
}
