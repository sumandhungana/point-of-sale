package com.puff.tech.inventorymanagement.usecase.purchasebill.update;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdatePurchaseBillUCResponse(
        Integer id,
        String purchaseNo,
        String message
) implements UCResponse {
}
