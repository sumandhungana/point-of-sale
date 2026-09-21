package com.puff.tech.usecase.bill.delete;

import com.puff.tech.core.usecases.UseCases;

public record DeleteBillUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
