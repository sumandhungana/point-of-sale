package com.puff.tech.usecase.supplier.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;


@Serdeable
public record UpdateSupplierUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
