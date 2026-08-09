package com.puff.tech.usecase.expenses.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteExpensesUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {}