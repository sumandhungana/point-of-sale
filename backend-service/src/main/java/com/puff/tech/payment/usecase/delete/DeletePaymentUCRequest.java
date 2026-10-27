package com.puff.tech.payment.usecase.delete;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;
import jakarta.inject.Singleton;

@Serdeable
public record DeletePaymentUCRequest(
        Long paymentId
)
implements UCRequest {
}
