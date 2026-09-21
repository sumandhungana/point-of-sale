package com.puff.tech.usecase.customer.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateCustomerUseCaseResponse(
        String message,
        Integer id
)
implements UseCases.UseCaseResponse {
}
