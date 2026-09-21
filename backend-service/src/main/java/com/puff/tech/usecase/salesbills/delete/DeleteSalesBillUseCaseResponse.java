package com.puff.tech.usecase.salesbills.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteSalesBillUseCaseResponse(
        String message
)
implements UseCases.UseCaseResponse {
}
