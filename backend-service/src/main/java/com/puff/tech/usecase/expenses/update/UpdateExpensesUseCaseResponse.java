package com.puff.tech.usecase.expenses.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateExpensesUseCaseResponse(
        String message
)
implements UseCase.UseCaseResponse {
}
