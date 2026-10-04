package com.puff.tech.inventorymanagement.usecase.category.getAll;

import com.puff.tech.core.usecases.UCResponse;
import com.puff.tech.inventorymanagement.CategoryType;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

import java.time.Instant;

@Builder
@Serdeable
public record GetAllCategoriesUCResponse(
        Long id,
        String name,
        String description,
        CategoryType categoryType,
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy
) implements UCResponse {
}
