package com.puff.tech.usecase.salesbills.getone;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneSalesBillUseCaseRequest(
        Integer id
)implements UseCases.UseCaseRequest {
}
