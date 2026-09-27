package com.puff.tech.onboarding.usecase.member.get;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.time.Instant;
import java.time.LocalDateTime;

@Builder
@Serdeable
public record GetSelectedMemberUCResponse(
        Integer id,
        String organizationName,
        String organizationContactNumber,
        String organizationAddress,
        String organizationEmail,
        String businessCategory,
        String organizationType,
        String panVatNumber,
        String branch,
        String kyc,
        String imagePath,
        Boolean isUsed,
        Instant createdAt,
        Instant updatedAt,
        String updatedBy,
        String createdBy
) implements UCResponse {
}
