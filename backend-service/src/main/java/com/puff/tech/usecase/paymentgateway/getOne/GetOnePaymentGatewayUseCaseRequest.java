package com.puff.tech.usecase.paymentgateway.getOne;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOnePaymentGatewayUseCaseRequest(
        Integer id
) implements UseCases.UseCaseRequest {
}
