package com.puff.tech.usecase.payment.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdatePaymentUseCaseResponse(
        String message
)implements UseCase.UseCaseResponse {
}
