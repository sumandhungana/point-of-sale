package com.puff.tech.usecase.cashbook.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateCashBookUseCaseResponse(
        Integer id,
        String message
)
implements UseCase.UseCaseResponse {
}
