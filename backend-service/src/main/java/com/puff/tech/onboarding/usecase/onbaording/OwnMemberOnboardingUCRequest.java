package com.puff.tech.onboarding.usecase.onbaording;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record OwnMemberOnboardingUCRequest(
        String organizationEmail,
        String organizationName,
        String panVatNumber,
        String branch,
        String organizationType,
        String organizationAddress,
        String organizationPhoneNumber,
        String notes
) implements UCRequest {
}
