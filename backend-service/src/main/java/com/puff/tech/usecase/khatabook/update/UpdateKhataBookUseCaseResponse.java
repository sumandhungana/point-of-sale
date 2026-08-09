package com.puff.tech.usecase.khatabook.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateKhataBookUseCaseResponse(
        String message
)implements UseCase.UseCaseResponse {
}
