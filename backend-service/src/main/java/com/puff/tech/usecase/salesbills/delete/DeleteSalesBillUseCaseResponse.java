package com.puff.tech.usecase.salesbills.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteSalesBillUseCaseResponse(
        String message
)
implements UseCase.UseCaseResponse {
}
