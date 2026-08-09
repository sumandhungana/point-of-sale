package com.puff.tech.usecase.category.update;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateCategoryUseCaseResponse(
        String message
) implements UseCase.UseCaseResponse {
}
