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
        String name,
        String number,
        String address,
        String email,
        String companyName,
        String companyNumber,
        String companyAddress,
        String companyEmail,
        String businessCategory,
        String businessType,
        String taxVat,
        String bookAccount,
        String kyc,
        String imagePath,
        Boolean isUsed,
        Instant createdAt,
        Instant updatedAt
) implements UCResponse {
}
