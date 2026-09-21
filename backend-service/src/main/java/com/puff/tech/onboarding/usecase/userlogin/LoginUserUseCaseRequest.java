package com.puff.tech.usermanagement.usecase.userlogin;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record LoginUserUseCaseRequest(
        String username,
        String password
)
implements UseCases.UseCaseRequest {
}
