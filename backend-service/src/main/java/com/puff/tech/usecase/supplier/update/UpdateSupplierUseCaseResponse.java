package com.puff.tech.usecase.supplier.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;


@Serdeable
public record UpdateSupplierUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
