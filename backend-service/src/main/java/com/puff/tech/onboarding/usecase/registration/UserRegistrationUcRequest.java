package com.puff.tech.usermanagement.usecase.registration;

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
) implements UseCases.UseCaseRequest {

}
