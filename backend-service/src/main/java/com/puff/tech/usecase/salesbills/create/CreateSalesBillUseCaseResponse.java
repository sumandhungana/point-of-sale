package com.puff.tech.usecase.salesbills.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateSalesBillUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
