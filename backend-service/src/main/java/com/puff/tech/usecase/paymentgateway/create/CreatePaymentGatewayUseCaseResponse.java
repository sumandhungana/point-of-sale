package com.puff.tech.usecase.paymentgateway.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreatePaymentGatewayUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
