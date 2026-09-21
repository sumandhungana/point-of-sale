package com.puff.tech.onboarding.usecase.registration;

import com.puff.tech.core.usecases.UCRequest;
import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UserRegistrationUcRequest(
        String userName,
        String phoneNumber,
        String gmail,
        String organizationName,
        String panVatNumber,
        String branch,
        String organizationType,
        String organizationAddress,
        String notes,
        String password,
        String userId
) implements UCRequest {

}
