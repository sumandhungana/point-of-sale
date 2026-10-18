package com.puff.tech.onboarding.usecase.user.add;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record AddUserUCRequest(
        String userName,
        String email,
        String password,
        String phoneNumber,
        String role,
        Boolean enable
) implements UCRequest {
}
