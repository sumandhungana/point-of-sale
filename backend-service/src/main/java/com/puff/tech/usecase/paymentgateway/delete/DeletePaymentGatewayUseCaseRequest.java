package com.puff.tech.usecase.paymentgateway.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeletePaymentGatewayUseCaseRequest(
        Integer id
)implements UseCases.UseCaseRequest {
}
