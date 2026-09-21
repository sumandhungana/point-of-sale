package com.puff.tech.usecase.khatabook.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateKhataBookUseCaseResponse(
        String message
)
implements UseCases.UseCaseResponse {
}
