package com.puff.tech.usermanagement.usecase;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

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
) implements UseCase.UseCaseRequest {

}
