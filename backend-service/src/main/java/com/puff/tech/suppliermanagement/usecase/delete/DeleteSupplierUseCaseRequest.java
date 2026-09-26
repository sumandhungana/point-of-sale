package com.puff.tech.suppliermanagement.usecase.delete;

import com.puff.tech.core.usecases.UCRequest;
import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteSupplierUseCaseRequest(
        Integer id
)implements UCRequest {
}
