package com.puff.tech.usecase.smsgateway.getone;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneSmsUseCaseRequest(
        Integer id
) implements UseCase.UseCaseRequest {
}
