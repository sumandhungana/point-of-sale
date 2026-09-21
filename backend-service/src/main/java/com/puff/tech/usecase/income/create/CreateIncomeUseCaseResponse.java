package com.puff.tech.usecase.income.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateIncomeUseCaseResponse(
        String message
)
implements UseCases.UseCaseResponse {
}
