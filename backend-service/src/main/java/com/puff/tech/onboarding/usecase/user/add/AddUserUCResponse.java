package com.puff.tech.onboarding.usecase.user.add;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.time.Instant;

@Serdeable
@Builder
public record AddUserUCResponse(
        Long id,
        Long userId,
        String userName,
        String email,
        String phoneNumber,
        String role,
        Boolean isActive,
        Long memberId,
        String memberName,
        String createdBy,
        Instant createdAt
) implements UCResponse {
}
