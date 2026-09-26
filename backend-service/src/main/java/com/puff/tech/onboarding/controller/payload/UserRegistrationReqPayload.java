package com.puff.tech.onboarding.controller.payload;

import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Serdeable
public record UserRegistrationReqPayload(
        @NotBlank(message = "User name is required")
        String userName,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits")
        String phoneNumber,

        @NotBlank(message = "Gmail is required")
        @Email(message = "Invalid email format")
        String gmail,

        @NotBlank(message = "Password is required")
        String password,

        @NotBlank(message = "Organization name is required")
        String organizationName,

        String panVatNumber,

        String branch,

        @NotBlank(message = "Organization type is required")
        String organizationType,

        @NotBlank(message = "Organization address is required")
        String organizationAddress,

        @Size(max = 500, message = "Notes cannot exceed 500 characters")
        String notes,
        @NotBlank(message = "Role is required")
        String role
) {
}
