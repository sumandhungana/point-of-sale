package com.puff.tech.payment.usecase.delete;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

import lombok.Builder;

@Builder
@Serdeable
public record DeletePaymentUCResponse(
        String message
)
implements UCResponse {
}
