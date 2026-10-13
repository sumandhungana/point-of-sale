package com.puff.tech.onboarding.usecase.member.approve;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Builder
@Serdeable
public record ApproveOrganizationUCResponse(
        Long memberId,
        Long userId,
        String status,
        String message
) implements UCResponse {
}
