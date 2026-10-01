package com.puff.tech.onboarding.usecase.getallorganization;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.time.Instant;

@Builder
@Serdeable
public record GetAllOrganizationUCResponse(
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
)
implements UCResponse {
}
