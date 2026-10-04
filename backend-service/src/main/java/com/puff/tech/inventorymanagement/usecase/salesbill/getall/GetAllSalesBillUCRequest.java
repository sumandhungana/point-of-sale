package com.puff.tech.inventorymanagement.usecase.salesbill.getall;

import com.puff.tech.core.usecases.UCRequest;
import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record GetAllSalesBillUCRequest(

) implements UCRequest {
}
