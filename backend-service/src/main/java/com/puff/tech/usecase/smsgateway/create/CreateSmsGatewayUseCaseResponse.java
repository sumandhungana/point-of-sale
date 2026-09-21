package com.puff.tech.usecase.smsgateway.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateSmsGatewayUseCaseResponse(
        String message
)
implements UseCases.UseCaseResponse {
}
