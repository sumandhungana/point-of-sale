package com.puff.tech.usecase.cashbook.delete;

import com.puff.tech.core.usecases.UseCases;

public record DeleteCashBookUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
