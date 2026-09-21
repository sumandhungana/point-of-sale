package com.puff.tech.usecase.income.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateIncomeUseCaseResponse(
        String message
)
implements UseCases.UseCaseResponse {
}
