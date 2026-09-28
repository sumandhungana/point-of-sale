package com.puff.tech.onboarding.usecase.registration;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Serdeable
@Builder
public record UserRegistrationUcRequest(
        String userName,
        String phoneNumber,
        String gmail,
        String organizationEmail,
        String organizationContactNumber,
        String organizationName,
        String panVatNumber,
        String branch,
        String organizationType,
        String organizationAddress,
        String notes,
        String password,
        String userId,
        String role,
        boolean isExternalOnboarding,
        boolean isSelfOrganizationOnboarded
) implements UCRequest {

}
