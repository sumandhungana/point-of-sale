package com.puff.tech.usecase.category.create;

import com.puff.tech.core.usecases.UseCase;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateCategoryUseCaseRequest(
        String name,
        String description,
        Integer categoryType
)
implements UseCase.UseCaseRequest {
}
