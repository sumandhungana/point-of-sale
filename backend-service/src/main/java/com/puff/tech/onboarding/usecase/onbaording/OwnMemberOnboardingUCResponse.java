package com.puff.tech.onboarding.usecase.onbaording;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record OwnMemberOnboardingUCResponse(
        Long id,
        String message
) implements UCResponse {
}
