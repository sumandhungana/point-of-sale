package com.puff.tech.usecase.salesbillitems.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteSalesBillItemUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
