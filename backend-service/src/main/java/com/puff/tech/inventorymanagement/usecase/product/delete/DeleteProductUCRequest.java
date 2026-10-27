package com.puff.tech.inventorymanagement.usecase.product.delete;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteProductUCRequest(
        Long id
) implements UCRequest {
}
