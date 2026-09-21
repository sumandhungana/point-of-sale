package com.puff.tech.usecase.salesbills.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteSalesBillUseCaseRequest(
        Integer id
)implements UseCases.UseCaseRequest {
}
