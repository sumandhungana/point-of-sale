package com.puff.tech.inventorymanagement.usecase.product.delete;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record DeleteProductUCResponse(
        String message
) implements UCResponse {
}
