package com.puff.tech.usecase.salesbillitems.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;


@Serdeable
public record CreateSalesBillItemUseCaseResponse(
        String message
)implements UseCase.UseCaseResponse {
}
