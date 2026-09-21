package com.puff.tech.usecase.salesbillitems.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteSalesBillItemUseCaseRequest(
        Integer id
)implements UseCases.UseCaseRequest {
}
