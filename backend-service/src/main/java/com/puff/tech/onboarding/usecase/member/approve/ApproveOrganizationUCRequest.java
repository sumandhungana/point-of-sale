package com.puff.tech.onboarding.usecase.member.approve;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
@Serdeable
public record ApproveOrganizationUCRequest(
        @NotNull(message = "Organization ID is required")
        Long memberId,
        Long userId,
        String roleId
) implements UCRequest {
}
