package com.puff.tech.usecase.paymentgateway.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdatePaymentGatewayUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
