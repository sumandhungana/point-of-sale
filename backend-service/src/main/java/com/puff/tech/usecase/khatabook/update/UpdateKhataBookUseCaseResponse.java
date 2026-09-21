package com.puff.tech.usecase.khatabook.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateKhataBookUseCaseResponse(
        String message
)implements UseCases.UseCaseResponse {
}
