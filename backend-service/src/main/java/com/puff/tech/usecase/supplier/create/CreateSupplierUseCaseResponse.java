package com.puff.tech.usecase.supplier.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateSupplierUseCaseResponse(
        String message
)implements UseCase.UseCaseResponse {
}
