package com.puff.tech.usecase.smsgateway.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateSmsGatewayUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
