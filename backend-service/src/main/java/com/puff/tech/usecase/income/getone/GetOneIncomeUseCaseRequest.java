package com.puff.tech.usecase.income.getone;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneIncomeUseCaseRequest(
        Integer id
) implements UseCases.UseCaseRequest {
}
