package com.puff.tech.inventorymanagement.usecase.purchasebill.add;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record AddPurchaseBillUCResponse(
        Integer id,
        String purchaseNo
) implements UCResponse {
}
