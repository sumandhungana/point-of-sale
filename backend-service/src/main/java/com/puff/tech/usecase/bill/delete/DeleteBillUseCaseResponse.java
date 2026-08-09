package com.puff.tech.usecase.bill.delete;

import com.puff.tech.core.usecases.UseCase;

public record DeleteBillUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
