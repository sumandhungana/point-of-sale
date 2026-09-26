package com.puff.tech.payment.usecase.get;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.payment.enums.PaymentCategory;
import com.puff.tech.payment.enums.PaymentParty;
import com.puff.tech.payment.enums.PaymentType;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;
import java.time.Instant;

@Serdeable
public record GetPaymentUCResponse(
        Long id,
        PaymentParty paymentParty,
        BigDecimal amount,
        PaymentType paymentType,
        PaymentCategory paymentCategory,
        String billPath,
        String remarks,
        Instant createdAt,
        BigDecimal oldBalance,
        BigDecimal newBalance,
        Instant updatedAt
) implements UCResponse {
}
