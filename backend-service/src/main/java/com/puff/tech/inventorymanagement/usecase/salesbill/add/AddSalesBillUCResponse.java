package com.puff.tech.inventorymanagement.usecase.salesbill.add;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record AddSalesBillUCResponse(
        String id,
        String message
) implements UCResponse {
}
