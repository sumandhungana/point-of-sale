package com.puff.tech.inventorymanagement.usecase.purchasebill.getsingle;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetSinglePurchaseBillUCRequest(
        Integer id
) implements UCRequest  {
}
