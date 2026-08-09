package com.puff.tech.usecase.salesbills.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateSalesBillUseCaseResponse(
        String message
)implements UseCase.UseCaseResponse {
}
