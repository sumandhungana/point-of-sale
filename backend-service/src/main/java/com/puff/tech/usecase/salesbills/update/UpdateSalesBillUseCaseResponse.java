package com.puff.tech.usecase.salesbills.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateSalesBillUseCaseResponse(
        String message
)implements UseCases.UseCaseResponse {
}
