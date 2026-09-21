package com.puff.tech.onboarding.usecase.userlogout;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record LogoutUserUseCaseResponse (
        String message
)
implements UseCases.UseCaseResponse {
}
