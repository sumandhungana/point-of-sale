package com.puff.tech.depositmanagement.usecase.add;

import com.puff.tech.core.usecases.UCRequest;
import com.puff.tech.payment.enums.PaymentParty;
import io.micronaut.serde.annotation.Serdeable;

import java.math.BigDecimal;

@Serdeable
public record AddDepositUCRequest(
        PaymentParty paymentParty,
        long partyId,
        BigDecimal amount,
        String remarks
)
implements UCRequest {
}
