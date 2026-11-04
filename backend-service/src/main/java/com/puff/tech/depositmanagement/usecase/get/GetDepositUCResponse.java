package com.puff.tech.depositmanagement.usecase.get;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.onboarding.repository.MemberEntity;
import com.puff.tech.payment.enums.PaymentParty;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;

@Serdeable
@Builder
public record GetDepositUCResponse(
        long id,
        MemberEntity member,
        PaymentParty paymentParty,
        long partyId,
        BigDecimal amount,
        String remarks,
        String createdBy,
        Instant createdAt,
        String updatedBy,
        Instant updatedAt

) implements UCResponse {
}

