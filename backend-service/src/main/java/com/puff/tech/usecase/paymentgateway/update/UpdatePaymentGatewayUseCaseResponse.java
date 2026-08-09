package com.puff.tech.usecase.paymentgateway.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdatePaymentGatewayUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
