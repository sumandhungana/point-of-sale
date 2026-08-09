package com.puff.tech.usecase.income.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteIncomeUseCaseRequest(
        Integer id
) implements UseCase.UseCaseRequest {
}
