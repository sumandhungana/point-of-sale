package com.puff.tech.usecase.customer.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteCustomerUseCaseResponse(
        String message
)implements UseCase.UseCaseResponse {
}
