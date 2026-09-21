package com.puff.tech.onboarding.usecase.registration;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UserRegistrationUcResponse(
        Long userId,
        String gmail,
        String userName,
        String organizationName,
        String memberId,
        String message,
        boolean success,
        String errorMessage
) implements UCResponse {
    public static UserRegistrationUcResponse success(Long userId, String gmail, String userName, String organizationName, String memberId) {
        return new UserRegistrationUcResponse(userId, gmail, userName, organizationName, memberId, "Registration successful", true, null);
    }

    // Overloaded factory method without memberId for backward compatibility
    public static UserRegistrationUcResponse success(Long userId, String gmail, String userName, String organizationName) {
        return new UserRegistrationUcResponse(userId, gmail, userName, organizationName, null, "Registration successful", true, null);
    }

    // Factory method for errors
    public static UserRegistrationUcResponse error(String errorMessage) {
        return new UserRegistrationUcResponse(null, null, null, null, null, null, false, errorMessage);
    }
}
