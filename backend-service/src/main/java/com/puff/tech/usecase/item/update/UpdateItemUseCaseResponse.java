package com.puff.tech.usecase.item.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateItemUseCaseResponse(
        String message
)
implements UseCase.UseCaseResponse {
}
