package com.puff.tech.usecase.category.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateCategoryUseCaseResponse(
        String message
)
implements UseCase.UseCaseResponse {
}
