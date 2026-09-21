package com.puff.tech.usecase.expenses.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteExpensesUseCaseRequest(
        Integer id
) implements UseCases.UseCaseRequest {}
