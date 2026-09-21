package com.puff.tech.usecase.item.create;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateItemUseCaseResponse(
        String message
)implements UseCases.UseCaseResponse {
}
