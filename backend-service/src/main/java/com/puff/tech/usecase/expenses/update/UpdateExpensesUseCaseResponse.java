package com.puff.tech.usecase.expenses.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateExpensesUseCaseResponse(
        String message
)
implements UseCases.UseCaseResponse {
}
