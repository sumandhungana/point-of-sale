package com.puff.tech.usecase.cashbook.delete;

import com.puff.tech.core.usecases.UseCase;

public record DeleteCashBookUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
