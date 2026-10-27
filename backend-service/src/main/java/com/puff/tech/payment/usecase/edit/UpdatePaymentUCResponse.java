package com.puff.tech.payment.usecase.edit;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Builder
@Serdeable
public record UpdatePaymentUCResponse (
        String message
)
implements UCResponse {
}
