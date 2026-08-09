package com.puff.tech.usecase.smsgateway.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateSmsGatewayUseCaseResponse(
        String message
)
implements UseCase.UseCaseResponse {
}
