package com.puff.tech.usecase.salesbills.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateSalesBillUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
