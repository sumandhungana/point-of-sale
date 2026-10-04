package com.puff.tech.inventorymanagement.usecase.category.add;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record AddCategoriesUCResponse(
        Long id,
        String message
) implements UCResponse {
}
