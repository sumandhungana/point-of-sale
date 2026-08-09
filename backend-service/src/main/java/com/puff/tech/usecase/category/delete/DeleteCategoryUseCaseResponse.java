package com.puff.tech.usecase.category.delete;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteCategoryUseCaseResponse(
        String message
)implements UseCase.UseCaseResponse {
}
