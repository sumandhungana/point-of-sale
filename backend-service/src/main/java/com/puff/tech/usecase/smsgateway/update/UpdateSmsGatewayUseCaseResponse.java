package com.puff.tech.usecase.smsgateway.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateSmsGatewayUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
