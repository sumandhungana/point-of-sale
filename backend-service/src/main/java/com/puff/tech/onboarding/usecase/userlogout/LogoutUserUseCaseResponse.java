package com.puff.tech.onboarding.usecase.userlogout;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record LogoutUserUseCaseResponse (
        String message
)
implements UCResponse {
}
