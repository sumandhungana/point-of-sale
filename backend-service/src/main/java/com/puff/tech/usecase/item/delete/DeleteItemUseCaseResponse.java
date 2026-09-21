package com.puff.tech.usecase.item.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteItemUseCaseResponse(
        String message
) implements UseCases.UseCaseResponse {
}
