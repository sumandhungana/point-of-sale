package com.puff.tech.usecase.salesbillitems.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteSalesBillItemUseCaseRequest(
        Integer id
)implements UseCase.UseCaseRequest {
}
