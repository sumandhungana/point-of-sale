package com.puff.tech.inventorymanagement.usecase.add;

import com.puff.tech.core.usecases.UCRequest;
import com.puff.tech.inventorymanagement.CategoryType;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record AddCategoriesUCRequest(
        String name,
        String description,
        CategoryType categoryType

) implements UCRequest {
}
