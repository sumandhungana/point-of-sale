package com.puff.tech.inventorymanagement.usecase.purchasebill.purchasenumber;

import com.puff.tech.core.usecases.UCResponse;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetPurchaseNumberUCResponse(
        String purchaseNo
) implements UCResponse {
}
