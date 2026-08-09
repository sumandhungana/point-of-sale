package com.puff.tech.usecase.income.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateIncomeUseCaseResponse(
        String message
)
implements UseCase.UseCaseResponse {
}
