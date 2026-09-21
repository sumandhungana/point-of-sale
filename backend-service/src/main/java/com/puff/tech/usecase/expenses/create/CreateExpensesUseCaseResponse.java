package com.puff.tech.usecase.expenses.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateExpensesUseCaseResponse(
        String message
)
implements UseCases.UseCaseResponse {
}
