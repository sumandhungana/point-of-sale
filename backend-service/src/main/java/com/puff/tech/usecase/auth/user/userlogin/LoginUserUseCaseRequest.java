package com.puff.tech.usecase.auth.user.userlogin;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record LoginUserUseCaseRequest(
        String userName,
        String password
)
implements UseCase.UseCaseRequest {
}
