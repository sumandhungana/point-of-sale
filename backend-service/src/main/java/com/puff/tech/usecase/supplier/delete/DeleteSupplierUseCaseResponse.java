package com.puff.tech.usecase.supplier.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteSupplierUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
