package com.puff.tech.usecase.income.getone;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetOneIncomeUseCaseRequest(
        Integer id
) implements UseCase.UseCaseRequest {
}
