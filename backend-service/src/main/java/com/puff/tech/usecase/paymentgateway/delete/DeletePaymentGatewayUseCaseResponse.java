package com.puff.tech.usecase.paymentgateway.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeletePaymentGatewayUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
