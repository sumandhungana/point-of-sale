package com.puff.tech.suppliermanagement.usecase.create;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateSupplierUseCaseResponse(
        String message
)implements UCResponse {
}
