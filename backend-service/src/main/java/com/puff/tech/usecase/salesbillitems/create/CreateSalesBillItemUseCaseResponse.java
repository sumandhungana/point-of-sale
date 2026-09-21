package com.puff.tech.usecase.salesbillitems.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;


@Serdeable
public record CreateSalesBillItemUseCaseResponse(
        String message
)implements UseCases.UseCaseResponse {
}
