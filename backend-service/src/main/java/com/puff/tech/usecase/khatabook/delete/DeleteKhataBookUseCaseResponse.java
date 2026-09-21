package com.puff.tech.usecase.khatabook.delete;

import com.puff.tech.core.usecases.UseCases;

public record DeleteKhataBookUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
