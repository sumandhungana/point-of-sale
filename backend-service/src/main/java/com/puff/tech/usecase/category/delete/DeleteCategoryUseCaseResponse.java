package com.puff.tech.usecase.category.delete;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteCategoryUseCaseResponse(
        String message
)implements UseCases.UseCaseResponse {
}
