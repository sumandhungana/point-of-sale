package com.puff.tech.usermanagement.usecase.registration;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UserRegistrationUcResponse(
        Long userId,
        String gmail,
        String userName,
        String organizationName,
        String message,
        boolean success,
        String errorMessage
) implements UseCases.UseCaseResponse {
    public static UserRegistrationUcResponse success(Long userId, String gmail, String userName, String organizationName) {
        return new UserRegistrationUcResponse(userId, gmail, userName, organizationName, "Registration successful", true, null);
    }

    // Factory method for errors
    public static UserRegistrationUcResponse error(String errorMessage) {
        return new UserRegistrationUcResponse(null, null, null, null, null, false, errorMessage);
    }
}
