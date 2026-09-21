package com.puff.tech.usecase.supplier.getone;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneSupplierUseCaseRequest(
        Integer id
)implements UseCases.UseCaseRequest {
}
