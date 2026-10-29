package com.puff.tech.inventorymanagement.usecase.salesbill.update;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateSalesBillUCResponse(
        String id,
        String message
) implements UCResponse {
}
