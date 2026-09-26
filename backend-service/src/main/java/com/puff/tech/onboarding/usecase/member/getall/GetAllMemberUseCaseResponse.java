package com.puff.tech.onboarding.usecase.member.getall;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.time.Instant;

@Serdeable
@Builder
public record GetAllMemberUseCaseResponse(
        Long id,
        String memberId,
        String organizationName,
        String panVatNumber,
        String organizationType,
        String branch,
        String organizationAddress,
        String notes
)implements UCResponse {
}
