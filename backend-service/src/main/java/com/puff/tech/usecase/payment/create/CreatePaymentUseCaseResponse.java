package com.puff.tech.usecase.payment.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreatePaymentUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
