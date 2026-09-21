package com.puff.tech.onboarding.usecase.userlogin;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record LoginUserUseCaseRequest(
        String username,
        String password
)
implements UCRequest {
}
