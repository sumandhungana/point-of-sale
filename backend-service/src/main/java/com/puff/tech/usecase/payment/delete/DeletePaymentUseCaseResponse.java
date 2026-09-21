package com.puff.tech.usecase.payment.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeletePaymentUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
