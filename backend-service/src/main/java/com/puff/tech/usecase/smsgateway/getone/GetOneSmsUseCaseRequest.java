package com.puff.tech.usecase.smsgateway.getone;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneSmsUseCaseRequest(
        Integer id
) implements UseCases.UseCaseRequest {
}
