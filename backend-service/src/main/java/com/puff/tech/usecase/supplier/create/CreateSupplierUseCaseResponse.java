package com.puff.tech.usecase.supplier.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateSupplierUseCaseResponse(
        String message
)implements UseCases.UseCaseResponse {
}
