package com.puff.tech.payment.usecase.add;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record AddPaymentUCResponse(
        String id,
        String message
) implements UCResponse {
}
