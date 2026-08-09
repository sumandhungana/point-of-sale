package com.puff.tech.usecase.customer.add;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record AddCustomerUseCaseResponse(
        String message,
        Integer id
)
implements UseCase.UseCaseResponse {
}
