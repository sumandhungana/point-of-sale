package com.puff.tech.inventorymanagement.usecase.product.edit;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Serdeable
@Builder
public record EditProductUCResponse(
        Long id,
        String message
) implements UCResponse {
}
