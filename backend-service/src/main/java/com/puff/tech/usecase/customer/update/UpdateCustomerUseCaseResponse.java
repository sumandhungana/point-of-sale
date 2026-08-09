package com.puff.tech.usecase.customer.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateCustomerUseCaseResponse(
        String message,
        Integer id
)
implements UseCase.UseCaseResponse {
}
