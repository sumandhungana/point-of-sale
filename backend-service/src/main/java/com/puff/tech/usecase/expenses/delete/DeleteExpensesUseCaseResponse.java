package com.puff.tech.usecase.expenses.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteExpensesUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {}