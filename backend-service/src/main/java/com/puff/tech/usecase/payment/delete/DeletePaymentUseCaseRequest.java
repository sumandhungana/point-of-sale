package com.puff.tech.usecase.payment.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeletePaymentUseCaseRequest(
        Integer id
) implements UseCase.UseCaseRequest {
}
