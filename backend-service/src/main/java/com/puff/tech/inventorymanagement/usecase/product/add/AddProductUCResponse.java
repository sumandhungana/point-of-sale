package com.puff.tech.inventorymanagement.usecase.product.add;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Builder;

@Builder
@Serdeable
public record AddProductUCResponse(
        Long id,
        String message
)
implements UCResponse {
}
