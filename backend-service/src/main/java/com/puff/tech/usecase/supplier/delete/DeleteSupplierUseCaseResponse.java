package com.puff.tech.usecase.supplier.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteSupplierUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
