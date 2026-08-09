package com.puff.tech.usecase.paymentgateway.getOne;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOnePaymentGatewayUseCaseRequest(
        Integer id
) implements UseCase.UseCaseRequest {
}
