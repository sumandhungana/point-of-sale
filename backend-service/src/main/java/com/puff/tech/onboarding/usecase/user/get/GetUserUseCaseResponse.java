package com.puff.tech.onboarding.usecase.user.get;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.time.Instant;

@Serdeable
@Builder
public record GetUserUseCaseResponse(
        Long userId,
        String userName,
        String role,
        boolean isActive,
        String createdBy,
        Instant createdAt,
        String  updatedBy,
        Instant updatedAt

) implements UCResponse {
}
