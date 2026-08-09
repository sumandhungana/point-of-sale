package com.puff.tech.usecase.category.get;

import com.puff.tech.core.usecases.UseCase;
import com.puff.tech.entity.KhataBookEntity;
import io.micronaut.data.annotation.DateCreated;
import io.micronaut.data.annotation.DateUpdated;
import io.micronaut.data.annotation.Relation;
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
implements UseCase.UseCaseResponse {
}


