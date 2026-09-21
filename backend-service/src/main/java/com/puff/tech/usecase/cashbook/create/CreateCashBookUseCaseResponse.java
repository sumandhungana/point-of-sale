package com.puff.tech.usecase.cashbook.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateCashBookUseCaseResponse(
        Integer id,
        String message
)
implements UseCases.UseCaseResponse {
}
