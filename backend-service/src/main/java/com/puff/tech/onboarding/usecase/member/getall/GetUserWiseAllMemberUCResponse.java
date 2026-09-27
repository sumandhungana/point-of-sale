package com.puff.tech.onboarding.usecase.member.getall;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.time.Instant;

@Serdeable
@Builder
public record GetUserWiseAllMemberUCResponse(
        Long id,
        Long referenceMemberId,
        String organizationName,
        String panVatNumber,
        String organizationType,
        String branch,
        String organizationAddress,
        String organizationEmail,
        String organizationContactNumber,
        String notes,
        Instant createdAt,
        String createdBy,
        Instant updatedAt,
        String updatedBy
)implements UCResponse {
}
