package com.puff.tech.usermanagement.usecase.user.add;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record AddUserUseCaseResponse(
        String message,
        Integer userId
)
implements UseCases.UseCaseResponse {
}
