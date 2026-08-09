package com.puff.tech.usecase.income.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateIncomeUseCaseResponse(
        String message
)
implements UseCase.UseCaseResponse {
}
