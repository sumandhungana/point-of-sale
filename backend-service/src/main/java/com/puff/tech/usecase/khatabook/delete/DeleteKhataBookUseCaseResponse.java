package com.puff.tech.usecase.khatabook.delete;

import com.puff.tech.core.usecases.UseCase;

public record DeleteKhataBookUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
