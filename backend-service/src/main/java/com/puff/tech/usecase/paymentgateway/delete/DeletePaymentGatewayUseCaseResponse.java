package com.puff.tech.usecase.paymentgateway.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeletePaymentGatewayUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
