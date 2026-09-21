package com.puff.tech.usecase.category.get;

import com.puff.tech.core.usecases.UseCases;
import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

@Serdeable
public record GetCategoryUseCaseResponse(
        Integer id,
        Integer khataBoookId,
        String name,
        String description,
        Integer categoryType,
        Instant createdAt,
        Instant updatedAt
)
implements UseCases.UseCaseResponse {
}


