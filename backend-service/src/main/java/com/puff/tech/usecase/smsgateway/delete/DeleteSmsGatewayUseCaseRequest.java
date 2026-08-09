package com.puff.tech.usecase.smsgateway.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteSmsGatewayUseCaseRequest(
        Integer id
) implements UseCase.UseCaseRequest {
}
