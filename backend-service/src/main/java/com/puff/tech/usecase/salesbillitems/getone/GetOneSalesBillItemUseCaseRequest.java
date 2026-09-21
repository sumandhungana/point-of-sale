package com.puff.tech.usecase.salesbillitems.getone;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneSalesBillItemUseCaseRequest(
        Integer id
) implements UseCases.UseCaseRequest {
}
