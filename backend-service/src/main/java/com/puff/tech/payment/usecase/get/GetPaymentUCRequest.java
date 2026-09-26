package com.puff.tech.payment.usecase.get;

import com.puff.tech.core.usecases.UCRequest;
import com.puff.tech.payment.enums.PaymentParty;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetPaymentUCRequest(
        PaymentParty paymentParty,
        Long partyId
) implements UCRequest {
}
