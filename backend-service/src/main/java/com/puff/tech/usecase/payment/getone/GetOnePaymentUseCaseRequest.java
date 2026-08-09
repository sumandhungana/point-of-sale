package com.puff.tech.usecase.payment.getone;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOnePaymentUseCaseRequest(
        Integer id
) implements UseCase.UseCaseRequest {
}
