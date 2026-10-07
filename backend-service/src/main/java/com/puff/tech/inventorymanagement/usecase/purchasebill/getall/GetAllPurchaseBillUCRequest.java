package com.puff.tech.inventorymanagement.usecase.purchasebill.getall;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetAllPurchaseBillUCRequest(

) implements UCRequest {
}
