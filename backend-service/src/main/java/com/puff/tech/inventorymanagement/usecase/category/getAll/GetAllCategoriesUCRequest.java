package com.puff.tech.inventorymanagement.usecase.category.getAll;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetAllCategoriesUCRequest(

) implements UCRequest {
}
