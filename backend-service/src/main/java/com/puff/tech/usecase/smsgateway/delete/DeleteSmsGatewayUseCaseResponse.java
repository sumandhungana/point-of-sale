package com.puff.tech.usecase.smsgateway.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteSmsGatewayUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
