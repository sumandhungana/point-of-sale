package com.puff.tech.usecase.khatabook.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateKhataBookUseCaseResponse(
        String message
)
implements UseCase.UseCaseResponse {
}
