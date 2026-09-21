package com.puff.tech.usecase.item.update;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateItemUseCaseResponse(
        String message
)
implements UseCases.UseCaseResponse {
}
