package com.puff.tech.usecase.payment.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreatePaymentUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
