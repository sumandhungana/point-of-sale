package com.puff.tech.usecase.salesbillitems.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateSalesBillItemUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
