package com.puff.tech.usecase.salesbillitems.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteSalesBillItemUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
